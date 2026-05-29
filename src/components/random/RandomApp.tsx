"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { APP_TABS, AppShell, type AppTabId } from "@/components/layout/AppShell";
import { PlayerLookup } from "@/components/player/PlayerLookup";
import { OneCardTab } from "@/components/random/OneCardTab";
import { TeamRandomTab } from "@/components/random/TeamRandomTab";
import { SettingsTab, type AppSettings } from "@/components/settings/SettingsTab";
import { LANES } from "@/constants/lanes";
import { I18nProvider, dataDragonLocale, useI18n } from "@/i18n/I18nProvider";
import { DEFAULT_LANGUAGE, isLanguage, type Language } from "@/i18n/dictionaries";
import { clearHistory, readHistory, writeHistory } from "@/services/storage.service";
import { randomOneCard, randomTeam } from "@/services/championRandom.service";
import type { Champion, ChampionApiResponse } from "@/types/champion";
import type { ChampionPick, HistoryEntry, LaneId, TeamResult } from "@/types/random";
import { randomId } from "@/utils/random";

type ChampionState =
  | { status: "loading" }
  | { status: "ready"; version: string; champions: Champion[] }
  | { status: "error"; message: string };

type RollingTarget = "one" | "team" | null;

const ALL_LANES = LANES.map((lane) => lane.id);
const SETTINGS_KEY = "random-tuong-lmht-settings-v1";
const ACTIVE_TAB_KEY = "random-lol-active-tab-v1";
const ONE_CARD_AUDIO_SRC = "/sounds/roulette-start2.mp3";
const ONE_CARD_AUDIO_START_SECONDS = 7;
const ONE_CARD_AUDIO_END_SECONDS = 15;
const DEFAULT_SETTINGS: AppSettings = {
  animationLevel: "full",
  defaultRegion: "VN2",
  defaultTeamMode: 2,
  language: DEFAULT_LANGUAGE,
  soundEnabled: true,
  theme: "esports",
};

function isAppTabId(value: string | null): value is AppTabId {
  return APP_TABS.some((tab) => tab.id === value);
}

export function RandomApp() {
  return (
    <I18nProvider>
      <RandomAppContent />
    </I18nProvider>
  );
}

function RandomAppContent() {
  const { language, setLanguage, t } = useI18n();
  const [activeTab, setActiveTab] = useState<AppTabId>("one");
  const [championState, setChampionState] = useState<ChampionState>({ status: "loading" });
  const [selectedLanes, setSelectedLanes] = useState<Record<LaneId, boolean>>({
    top: true,
    jungle: true,
    mid: true,
    ad: true,
    sp: true,
  });
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [teamMode, setTeamMode] = useState<1 | 2>(DEFAULT_SETTINGS.defaultTeamMode);
  const [rolling, setRolling] = useState<RollingTarget>(null);
  const [oneAudioPlaying, setOneAudioPlaying] = useState(false);
  const [oneSpinning, setOneSpinning] = useState(false);
  const [onePick, setOnePick] = useState<ChampionPick>();
  const [pendingOnePick, setPendingOnePick] = useState<ChampionPick>();
  const [revealingOnePick, setRevealingOnePick] = useState<ChampionPick>();
  const [teams, setTeams] = useState<TeamResult[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const finalizedOnePickId = useRef<string | undefined>(undefined);
  const oneAudioRef = useRef<HTMLAudioElement | undefined>(undefined);
  const oneAudioEnded = useRef(true);
  const oneSpinningRef = useRef(false);

  const isReady = championState.status === "ready";
  const champions = championState.status === "ready" ? championState.champions : [];
  const version = championState.status === "ready" ? championState.version : "-";
  const activeLanes = useMemo(() => ALL_LANES.filter((lane) => selectedLanes[lane]), [selectedLanes]);

  useEffect(() => {
    setHistory(readHistory());

    try {
      const savedTab = window.localStorage.getItem(ACTIVE_TAB_KEY);
      if (isAppTabId(savedTab)) {
        setActiveTab(savedTab);
      }

      const rawSettings = window.localStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        const nextSettings = {
          ...DEFAULT_SETTINGS,
          ...(JSON.parse(rawSettings) as Partial<AppSettings>),
        };
        if (!isLanguage(nextSettings.language)) {
          nextSettings.language = DEFAULT_SETTINGS.language;
        }
        setSettings(nextSettings);
        setTeamMode(nextSettings.defaultTeamMode);
        setLanguage(nextSettings.language);
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadChampions() {
      setChampionState({ status: "loading" });

      try {
        const response = await fetch(`/api/champions?locale=${dataDragonLocale(language)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(t("app.errorMessage"));
        }

        const data = (await response.json()) as ChampionApiResponse;
        setChampionState({
          status: "ready",
          version: data.version,
          champions: data.champions,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;

        setChampionState({
          status: "error",
          message: error instanceof Error ? error.message : t("app.errorMessage"),
        });
      }
    }

    loadChampions();
    return () => controller.abort();
  }, [language, t]);

  useEffect(() => {
    setSettings((currentSettings) => {
      if (currentSettings.language === language) return currentSettings;

      const nextSettings = { ...currentSettings, language };
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
      return nextSettings;
    });
  }, [language]);

  function updateSettings(nextSettings: AppSettings) {
    setSettings(nextSettings);
    setTeamMode(nextSettings.defaultTeamMode);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    if (nextSettings.language !== language) {
      setLanguage(nextSettings.language);
    }
  }

  function handleLanguageChange(nextLanguage: Language) {
    updateSettings({ ...settings, language: nextLanguage });
  }

  function handleResetSettings() {
    updateSettings(DEFAULT_SETTINGS);
  }

  function handleTabChange(tab: AppTabId) {
    setActiveTab(tab);
    window.localStorage.setItem(ACTIVE_TAB_KEY, tab);
  }

  function persistHistory(nextHistory: HistoryEntry[]) {
    setHistory(nextHistory);
    writeHistory(nextHistory);
  }

  function pushHistory(entry: Omit<HistoryEntry, "id" | "createdAt">) {
    setHistory((current) => {
      const nextHistory = [
        {
          ...entry,
          id: randomId("history"),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ];
      writeHistory(nextHistory);
      return nextHistory;
    });
  }

  function roll(target: Exclude<RollingTarget, null>, action: () => void) {
    if (!isReady || rolling) return;

    setRolling(target);
    window.setTimeout(
      () => {
        action();
        setRolling(null);
      },
      settings.animationLevel === "full" ? 720 : 180,
    );
  }

  function handleRandomOne() {
    if (championState.status !== "ready" || rolling || oneSpinning || oneAudioPlaying) return;

    const pick = randomOneCard(championState.version, championState.champions, language);
    finalizedOnePickId.current = undefined;
    oneAudioEnded.current = false;
    oneSpinningRef.current = true;
    setOnePick(undefined);
    setRevealingOnePick(undefined);
    setPendingOnePick(pick);
    setOneAudioPlaying(true);
    setOneSpinning(true);
    playOneCardAudio();
  }

  function finalizeOneCard(pick: ChampionPick) {
    if (finalizedOnePickId.current === pick.pickId) return;

    finalizedOnePickId.current = pick.pickId;
    setOnePick(pick);
    setPendingOnePick(pick);
    setRevealingOnePick(pick);
    oneSpinningRef.current = false;
    setOneSpinning(false);
    pushHistory({
      kind: "one-card",
      title: t("history.oneCard"),
      summary: `${pick.champion.name} · ${pick.lane.toUpperCase()}`,
      payload: pick,
    });

    if (oneAudioEnded.current) {
      setOneAudioPlaying(false);
    }
  }

  function closeOneCardReveal() {
    if (!revealingOnePick) return;

    setOnePick(revealingOnePick);
    setPendingOnePick(revealingOnePick);
    setRevealingOnePick(undefined);
  }

  function playOneCardAudio() {
    oneAudioRef.current?.pause();
    const audio = new Audio(ONE_CARD_AUDIO_SRC);
    audio.preload = "auto";
    oneAudioRef.current = audio;
    let audioFrame = 0;

    const releaseAudioGate = () => {
      window.cancelAnimationFrame(audioFrame);
      oneAudioEnded.current = true;
      if (!oneSpinningRef.current) {
        setOneAudioPlaying(false);
      }
      if (oneAudioRef.current === audio) {
        oneAudioRef.current = undefined;
      }
    };

    const watchAudioSegment = () => {
      if (audio.currentTime >= ONE_CARD_AUDIO_END_SECONDS) {
        audio.pause();
        releaseAudioGate();
        return;
      }

      audioFrame = window.requestAnimationFrame(watchAudioSegment);
    };

    const startAudioSegment = () => {
      audio.currentTime = ONE_CARD_AUDIO_START_SECONDS;

      void audio
        .play()
        .then(() => {
          audioFrame = window.requestAnimationFrame(watchAudioSegment);
        })
        .catch(() => {
          releaseAudioGate();
        });
    };

    audio.addEventListener("ended", releaseAudioGate, { once: true });
    audio.addEventListener("error", releaseAudioGate, { once: true });

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startAudioSegment();
    } else {
      audio.addEventListener("loadedmetadata", startAudioSegment, { once: true });
      audio.load();
    }
  }

  function handleRandomTeam(count: 1 | 2) {
    roll("team", () => {
      if (championState.status !== "ready") return;

      const lanes = activeLanes.length > 0 ? activeLanes : ALL_LANES;
      const blue = randomTeam(championState.version, championState.champions, lanes, t("team.blueTeam"), "blue", language);
      const nextTeams = [blue];

      if (count === 2) {
        const excluded = new Set(blue.picks.map((pick) => pick.champion.id));
        nextTeams.push(randomTeam(championState.version, championState.champions, lanes, t("team.redTeam"), "red", language, excluded));
      }

      setTeams(nextTeams);
      pushHistory({
        kind: count === 1 ? "one-team" : "two-team",
        title: count === 1 ? t("history.oneTeam") : t("history.twoTeam"),
        summary: nextTeams
          .map((team) => `${team.name}: ${team.picks.map((pick) => pick.champion.name).join(", ")}`)
          .join(" | "),
        payload: nextTeams,
      });
    });
  }

  function handleDeleteHistory(id: string) {
    persistHistory(history.filter((entry) => entry.id !== id));
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  function handleResetLocalData() {
    handleClearHistory();
  }

  return (
    <div className={`theme-${settings.theme} animation-${settings.animationLevel}`}>
      <AppShell
        activeTab={activeTab}
        championCount={championState.status === "ready" ? championState.champions.length : "..."}
        language={settings.language}
        onLanguageChange={handleLanguageChange}
        onTabChange={handleTabChange}
      >
        {championState.status === "error" && (
          <div className="workspace-panel app-error">
            <AlertTriangle className="h-6 w-6" />
            <strong>{t("app.errorTitle")}</strong>
            <span>{championState.message}</span>
          </div>
        )}

        {activeTab === "one" && (
          <OneCardTab
            champions={champions}
            disabled={!isReady || oneAudioPlaying}
            isAudioPlaying={oneAudioPlaying && !oneSpinning}
            isRolling={oneSpinning}
            onRandom={handleRandomOne}
            onRevealClose={closeOneCardReveal}
            onRouletteComplete={finalizeOneCard}
            pendingPick={pendingOnePick ?? onePick}
            pick={onePick}
            revealingPick={revealingOnePick}
            version={version}
          />
        )}
        {activeTab === "team" && (
          <TeamRandomTab
            disabled={!isReady}
            isRolling={rolling === "team"}
            mode={teamMode}
            onModeChange={setTeamMode}
            onRandom={handleRandomTeam}
            onToggleLane={(lane) =>
              setSelectedLanes((current) => ({
                ...current,
                [lane]: !current[lane],
              }))
            }
            selectedLanes={selectedLanes}
            teams={teams}
          />
        )}
        {activeTab === "player" && <PlayerLookup defaultRegion={settings.defaultRegion} />}
        {activeTab === "settings" && (
          <SettingsTab
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteHistory={handleDeleteHistory}
            onResetLocalData={handleResetLocalData}
            onResetSettings={handleResetSettings}
            onSettingsChange={updateSettings}
            settings={settings}
          />
        )}
      </AppShell>
    </div>
  );
}
