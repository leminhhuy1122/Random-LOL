"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ChevronDown, Crosshair, Crown, Eye, Flame, ScanSearch, Shield, Sparkles, Swords, TrendingUp, UserRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { TranslationKey } from "@/i18n/dictionaries";
import type { ChampionTag } from "@/types/champion";
import type { PlayerChampionStat, PlayerLookupResult, PlayerMatchItem, RankInfo } from "@/types/player";

type PlayerChampionBannerProps = {
  player?: PlayerLookupResult;
  loading?: boolean;
  error?: {
    message: string;
    code?: string;
  };
};

type BannerStyle = CSSProperties & {
  "--champion-splash"?: string;
};

type PlayerTab = "overview" | "history";
type ChampionModalMode = "played" | "winrate";
type MatchFilter = "all" | "solo" | "flex" | "aram";

const TAB_STORAGE_KEY = "random-lol-player-tab";

const MATCH_FILTERS: Array<{ key: MatchFilter; labelKey: "player.allModes" | "player.rankedSoloDuo" | "player.rankedFlex"; fallback?: string }> = [
  { key: "all", labelKey: "player.allModes" },
  { key: "solo", labelKey: "player.rankedSoloDuo" },
  { key: "flex", labelKey: "player.rankedFlex" },
  { key: "aram", labelKey: "player.allModes", fallback: "ARAM" },
];

const ANALYSIS_ROWS = [
  { key: "combat", labelKey: "player.combat" },
  { key: "attack", labelKey: "player.attack" },
  { key: "farm", labelKey: "player.farm" },
  { key: "objective", labelKey: "player.objective" },
  { key: "vision", labelKey: "player.vision" },
] as const;

const ROLE_ACTIVITY: Array<{ icon: LucideIcon; labelKey: TranslationKey; tag: ChampionTag }> = [
  { icon: Swords, labelKey: "player.roleFighter", tag: "Fighter" },
  { icon: Shield, labelKey: "player.roleTank", tag: "Tank" },
  { icon: Sparkles, labelKey: "player.roleMage", tag: "Mage" },
  { icon: Flame, labelKey: "player.roleAssassin", tag: "Assassin" },
  { icon: Eye, labelKey: "player.roleSupport", tag: "Support" },
  { icon: Crosshair, labelKey: "player.roleMarksman", tag: "Marksman" },
];

export function PlayerChampionBanner({ player, loading = false, error }: PlayerChampionBannerProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<PlayerTab>("overview");
  const [imageFailed, setImageFailed] = useState(false);
  const [championModal, setChampionModal] = useState<ChampionModalMode | null>(null);

  const topChampion = player?.topChampion;
  const showChampionBackground = Boolean(topChampion && !imageFailed);
  const bannerStyle: BannerStyle | undefined = showChampionBackground
    ? { "--champion-splash": `url("${topChampion?.splashUrl}")` }
    : undefined;

  useEffect(() => {
    const savedTab = window.localStorage.getItem(TAB_STORAGE_KEY);
    if (savedTab === "overview" || savedTab === "history") {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    setImageFailed(false);
    setChampionModal(null);
  }, [topChampion?.splashUrl, player?.riotId]);

  useEffect(() => {
    if (!championModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setChampionModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [championModal]);

  const handleTabChange = (tab: PlayerTab) => {
    setActiveTab(tab);
    window.localStorage.setItem(TAB_STORAGE_KEY, tab);
  };

  if (loading) {
    return (
      <article className="player-profile-dashboard is-loading">
        <div className="player-dashboard-glow" />
        <div className="player-dashboard-scan" />
        <div className="player-dashboard-center">
          <div className="hextech-orb">
            <ScanSearch className="h-9 w-9" />
          </div>
          <strong>{t("player.scanning")}</strong>
          <span>{t("player.scanningCopy")}</span>
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="player-profile-dashboard is-error">
        <div className="player-dashboard-glow" />
        <div className="player-dashboard-center">
          <div className="hextech-orb is-error">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <strong>{error.code === "MISSING_API_KEY" ? t("player.missingKey") : t("player.errorTitle")}</strong>
          <span>{error.message}</span>
        </div>
      </article>
    );
  }

  if (!player) {
    return (
      <article className="player-profile-dashboard is-empty">
        <div className="player-dashboard-glow" />
        <div className="player-dashboard-center">
          <div className="hextech-orb">
            <UserRound className="h-9 w-9" />
          </div>
          <strong>{t("player.idleTitle")}</strong>
          <span>{t("player.idleCopy")}</span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`player-profile-dashboard is-revealed ${showChampionBackground ? "has-champion-art" : "has-fallback-art"}`}
      style={bannerStyle}
    >
      {topChampion && <img className="player-banner-preload" src={topChampion.splashUrl} alt="" onError={() => setImageFailed(true)} />}
      <ProfileHero player={player} showChampionBackground={showChampionBackground} />

      <div className="player-profile-tabs" role="tablist" aria-label={t("player.tabsLabel")}>
        <button className={activeTab === "overview" ? "is-active" : ""} type="button" onClick={() => handleTabChange("overview")}>
          {t("player.overview")}
        </button>
        <button className={activeTab === "history" ? "is-active" : ""} type="button" onClick={() => handleTabChange("history")}>
          {t("player.matchHistory")}
        </button>
      </div>

      {activeTab === "overview" ? (
        <OverviewTab player={player} onOpenChampionModal={setChampionModal} />
      ) : (
        <HistoryTab player={player} />
      )}

      {championModal && (
        <ChampionStatsModal
          mode={championModal}
          champions={championModal === "played" ? player.championStats : player.championStats.filter((champion) => champion.games >= 3)}
          onClose={() => setChampionModal(null)}
        />
      )}
    </article>
  );
}

function ProfileHero({ player, showChampionBackground }: { player: PlayerLookupResult; showChampionBackground: boolean }) {
  const { t } = useI18n();

  return (
    <header className="player-profile-hero">
      {showChampionBackground && <div className="player-profile-hero-bg" />}
      <div className="player-profile-hero-overlay" />
      <div className="player-profile-avatar">
        <img src={player.profileIconUrl} alt={player.riotId} />
        <strong>{player.level}</strong>
      </div>
      <div className="player-profile-main">
        <div className="player-name-line">
          <h2>{player.riotId.split("#")[0]}</h2>
          <span>#{player.riotId.split("#")[1] ?? player.region}</span>
        </div>
        <p>
          {t("player.levelRegion", { level: player.level, region: player.region })}
          <span className="player-region-pill">{player.region === "VN2" ? t("player.regionVietnam") : player.region}</span>
        </p>
        <div className="player-rank-strip">
          <RankSummary title={t("player.rankSoloDuo")} rank={player.soloRank} />
          <RankSummary title={t("player.rankFlex")} rank={player.flexRank} />
        </div>
      </div>
    </header>
  );
}

function RankSummary({ title, rank }: { title: string; rank?: RankInfo }) {
  const { t } = useI18n();

  return (
    <div className="player-rank-summary">
      <span className="rank-queue-label">{title}</span>
      <img className="rank-emblem" src={getRankEmblemUrl(rank?.tier)} alt={rank ? `${rank.tier} emblem` : `${t("player.unranked")} emblem`} loading="lazy" />
      <strong style={{ color: getRankColor(rank?.tier) }}>{formatRank(rank, t)}</strong>
      <small>{rank ? `${rank.leaguePoints} LP` : "0 LP"}</small>
    </div>
  );
}

function OverviewTab({
  player,
  onOpenChampionModal,
}: {
  player: PlayerLookupResult;
  onOpenChampionModal: (mode: ChampionModalMode) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="player-overview-grid">
      <section className="player-overview-left">
        <OverviewPanel player={player} />
        <ChampionListPanel
          title={t("player.mostPlayedChampions")}
          champions={player.mostPlayedChampions}
          mode="played"
          onViewAll={() => onOpenChampionModal("played")}
          totalGames={player.performance.games}
        />
        <ChampionListPanel
          title={t("player.bestWinrateChampions")}
          champions={player.bestWinrateChampions}
          mode="winrate"
          onViewAll={() => onOpenChampionModal("winrate")}
          totalGames={player.performance.games}
        />
      </section>

      <section className="player-overview-right">
        <RankProgressPanel player={player} />
        <AnalysisPanel player={player} />
      </section>
    </div>
  );
}

function OverviewPanel({ player }: { player: PlayerLookupResult }) {
  const { t } = useI18n();
  const summary = player.performance;

  return (
    <section className="player-data-panel overview-panel">
      <h3>{t("player.overallPerformance")}</h3>
      <div className="overview-content">
        <WinrateRing value={summary.winrate} />
        <div className="overview-stats">
          <MetricLine value={summary.games} label={t("player.games")} accent={`${summary.wins}W - ${summary.losses}L`} />
          <MetricLine value={summary.kda} label="KDA" accent={`(${summary.kills} / ${summary.deaths} / ${summary.assists})`} />
          <MetricLine value={summary.csPerMinute} label={t("player.csPerMinute")} />
          <MetricLine value={`+${summary.damagePerMinute}`} label={t("player.damagePerMinute")} />
        </div>
      </div>
    </section>
  );
}

function MetricLine({ value, label, accent }: { value: number | string; label: string; accent?: string }) {
  return (
    <div className="metric-line">
      <strong>{value}</strong>
      <span>{label}</span>
      {accent && <small>{accent}</small>}
    </div>
  );
}

function WinrateRing({ value }: { value: number }) {
  const { t } = useI18n();
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="winrate-ring" style={{ "--ring-offset": offset } as CSSProperties}>
      <svg viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={radius} />
        <circle cx="60" cy="60" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div>
        <strong>{value}%</strong>
        <span>{t("player.winrate")}</span>
      </div>
    </div>
  );
}

function ChampionListPanel({
  title,
  champions,
  mode,
  onViewAll,
  totalGames,
}: {
  title: string;
  champions: PlayerChampionStat[];
  mode: ChampionModalMode;
  onViewAll: () => void;
  totalGames: number;
}) {
  const { t } = useI18n();
  const maxGames = Math.max(...champions.map((champion) => champion.games), 1);
  const safeTotalGames = Math.max(totalGames, 1);

  return (
    <section className="player-data-panel champion-list-panel">
      <div className="player-panel-head compact">
        <div>
          <h3>{title}</h3>
          <span className="champion-list-hint">
            {mode === "played" ? t("player.playedShareHint") : t("player.winrateShareHint")}
          </span>
        </div>
        <button type="button" onClick={onViewAll} aria-label={`${t("player.viewAll")} ${title}`}>
          {t("player.viewAll")}
        </button>
      </div>
      <div className="champion-stat-list">
        {champions.length > 0 ? (
          champions.map((champion) => {
            const playedPercent = Math.round((champion.games / safeTotalGames) * 100);
            const barWidth = mode === "played" ? (champion.games / maxGames) * 100 : champion.winrate;
            const valueLabel = mode === "played"
              ? t("player.playedShareValue", { percent: playedPercent })
              : t("player.winrateShareValue", { percent: champion.winrate });

            return (
              <div className="champion-stat-row" key={`${title}-${champion.championKey}`}>
                <img src={champion.championIconUrl} alt={champion.championName} loading="lazy" />
                <strong>{champion.championName}</strong>
                <span>{t("player.matchesCount", { count: champion.games })}</span>
                <div className="champion-stat-bar" title={mode === "played" ? t("player.playedShareTooltip", { games: champion.games, total: safeTotalGames, percent: playedPercent }) : t("player.winrateShareTooltip", { wins: champion.wins, games: champion.games, percent: champion.winrate })}>
                  <i style={{ width: `${barWidth}%` }} />
                </div>
                <em>{valueLabel}</em>
              </div>
            );
          })
        ) : (
          <div className="player-empty-data">{t("player.noChampionData")}</div>
        )}
      </div>
    </section>
  );
}

function RankProgressPanel({ player }: { player: PlayerLookupResult }) {
  const { language, t } = useI18n();
  const rank = player.soloRank;
  const rankedMatches = player.matches.filter((match) => match.queueGroup === "solo").slice(0, 12);
  const recentRanked = rankedMatches.length > 0 ? rankedMatches : player.matches.slice(0, 12);
  const winrate = rank ? Math.round((rank.wins / Math.max(rank.wins + rank.losses, 1)) * 1000) / 10 : 0;
  const recentWins = recentRanked.slice(0, 5).filter((match) => match.win).length;
  const locale = language === "vi" ? "vi-VN" : "en-US";

  return (
    <section className="rank-progress-card">
      <div className="rank-progress-top">
        <h3>{t("player.soloDuoRank")}</h3>
        <div className="rank-progress-summary">
          <img className="rank-progress-emblem" src={getRankEmblemUrl(rank?.tier)} alt={rank ? `${rank.tier} emblem` : `${t("player.unranked")} emblem`} loading="lazy" />
          <div className="rank-progress-info">
            <div className="rank-title-line">
              <strong style={{ color: getRankColor(rank?.tier) }}>{formatRank(rank, t)}</strong>
              <span>{rank ? `${rank.leaguePoints} LP` : "0 LP"}</span>
            </div>
            <div className="rank-progress-bar">
              <i style={{ width: `${rank ? Math.max(4, Math.min(rank.leaguePoints, 100)) : 0}%` }} />
            </div>
            <div className="rank-record-row">
              <span>{t("player.rankWinrate", { value: winrate.toLocaleString(locale) })}</span>
              <span>{rank ? t("player.rankRecord", { wins: rank.wins, losses: rank.losses }) : t("player.rankRecord", { wins: 0, losses: 0 })}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="rank-progress-chart-area">
        <div className="rank-mini-head">
          <h3>{t("player.recentRankedForm")}</h3>
          <span>{recentRanked.length > 0 ? t("player.recentRecord", { wins: recentWins, games: Math.min(5, recentRanked.length) }) : t("player.noData")}</span>
        </div>
        {recentRanked.length > 0 ? (
          <div className="rank-form-strip">
            {recentRanked.map((match) => (
              <span
                key={match.id}
                className={`rank-form-dot ${match.win ? "is-win" : "is-loss"}`}
                title={`${match.win ? t("player.win") : t("player.loss")} ${match.championName}`}
              >
                {match.win ? "W" : "L"}
              </span>
            ))}
          </div>
        ) : (
          <div className="player-empty-data">{t("player.noRankedData")}</div>
        )}
      </div>
    </section>
  );
}

function AnalysisPanel({ player }: { player: PlayerLookupResult }) {
  const { t } = useI18n();
  const summaryRows = [
    { label: "KDA", value: player.performance.kda, percent: Math.min(100, player.performance.kda * 18), top: "42%" },
    { label: t("player.csPerMinute"), value: player.performance.csPerMinute, percent: Math.min(100, player.performance.csPerMinute * 12), top: "58%" },
    { label: t("player.damagePerMinute"), value: player.performance.damagePerMinute, percent: Math.min(100, player.performance.damagePerMinute / 8), top: "47%" },
    { label: "KP", value: `${player.performance.killParticipation}%`, percent: player.performance.killParticipation, top: "53%" },
  ];

  return (
    <section className="player-data-panel analysis-panel">
      <div className="player-panel-head">
        <h3>{t("player.performanceAnalysis")}</h3>
        <button type="button">{t("player.compareAverage")} <ChevronDown className="h-4 w-4" /></button>
      </div>
      <div className="analysis-summary-card">
        <TrendingUp className="h-5 w-5" />
        <span>{player.performance.winrate >= 50 ? t("player.analysisStable") : t("player.analysisImprove")}</span>
      </div>
      <div className="analysis-performance-bars">
        {ANALYSIS_ROWS.map((row) => (
          <AnalysisMetric
            key={row.key}
            label={t(row.labelKey)}
            value={player.analysis[row.key]}
            percent={player.analysis[row.key]}
            top={`${Math.max(1, 100 - player.analysis[row.key])}%`}
          />
        ))}
        {summaryRows.map((row) => (
          <AnalysisMetric key={row.label} label={row.label} value={row.value} percent={row.percent} top={row.top} />
        ))}
      </div>
    </section>
  );
}

function AnalysisMetric({ label, value, percent, top }: { label: string; value: number | string; percent: number; top: string }) {
  return (
    <div className="analysis-metric">
      <div>
        <span>{label}</span>
        <small>Top {top}</small>
      </div>
      <strong>{value}</strong>
      <i><b style={{ width: `${Math.max(4, Math.min(percent, 100))}%` }} /></i>
    </div>
  );
}

function HistoryTab({ player }: { player: PlayerLookupResult }) {
  const { t } = useI18n();
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const recentMatches = player.matches.slice(0, 20);

  return (
    <div className="lol-history-layout">
      <section className="lol-history-main" aria-label={t("player.matchHistory")}>
        <div className="lol-history-titlebar">
          <h3>{t("player.recentMatchesTitle", { count: recentMatches.length })}</h3>
          <div className="lol-history-tabs" aria-label={t("player.matchFilterLabel")}>
            <button className="is-active" type="button">{t("player.overview")}</button>
            <button type="button">{t("player.tft")}</button>
          </div>
        </div>

        <div className="lol-match-list">
          {recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <LoLMatchRow
                key={match.id}
                match={match}
                active={activeMatchId === match.id}
                onMouseEnter={() => setActiveMatchId(match.id)}
                onMouseLeave={() => setActiveMatchId(null)}
              />
            ))
          ) : (
            <div className="player-empty-data">{t("player.noMatchesFilter")}</div>
          )}
        </div>
      </section>

      <aside className="lol-history-side">
        <RecentChampionsPanel player={player} />
        <RecentActivityPanel player={player} />
      </aside>
    </div>
  );
}

function LoLMatchRow({
  active,
  match,
  onMouseEnter,
  onMouseLeave,
}: {
  active: boolean;
  match: PlayerMatchItem;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const { t } = useI18n();
  const itemSlots = Array.from({ length: 7 }, (_, index) => match.items[index]);

  return (
    <article
      className={`lol-match-row ${match.win ? "is-win" : "is-loss"} ${active ? "is-active" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="lol-match-champion">
        <img src={match.championIconUrl} alt={match.championName} loading="lazy" />
        <strong>{match.level}</strong>
      </div>

      <div className="lol-match-result">
        <b>{match.win ? t("player.win") : t("player.loss")}</b>
        <span>{getQueueLabel(match, t)}</span>
        <div className="lol-match-spells">
          {match.summonerSpells.map((spell, index) => (
            <img key={`${match.id}-spell-${index}`} src={spell} alt="" loading="lazy" />
          ))}
        </div>
      </div>

      <div className="lol-match-loadout">
        <div className="lol-item-strip">
          {itemSlots.map((item, index) => (
            item ? <img key={`${match.id}-item-${index}`} src={item} alt="" loading="lazy" /> : <span key={`${match.id}-empty-${index}`} />
          ))}
        </div>
        <div className="lol-match-kda">
          <strong>{match.kills} / {match.deaths} / {match.assists}</strong>
          <span>{match.cs} <Sparkles className="h-4 w-4" /> {Math.round(match.damagePerMinute).toLocaleString("vi-VN")} <Shield className="h-4 w-4" /></span>
        </div>
      </div>

      <div className="lol-match-map">
        <strong>{match.queueName}</strong>
        <span>{formatMatchDate(match.gameEndedAt)}</span>
      </div>
    </article>
  );
}

function RecentChampionsPanel({ player }: { player: PlayerLookupResult }) {
  const { t } = useI18n();
  const totalGames = Math.max(player.performance.games, 1);
  const champions = player.championStats.slice(0, 3);

  return (
    <section className="lol-side-card lol-recent-champions">
      <h3>{t("player.recentChampions")}</h3>
      <div className="lol-champion-card-row">
        {champions.map((champion, index) => {
          const percent = Math.round((champion.games / totalGames) * 100);
          return (
            <article className="lol-champion-card" key={champion.championKey}>
              <div className="lol-champion-frame">
                <img src={champion.championIconUrl} alt={champion.championName} loading="lazy" />
                <span>{index + 1}</span>
              </div>
              <strong>{percent}%</strong>
            </article>
          );
        })}
      </div>
      <p>{t("player.playedPercent")}</p>
    </section>
  );
}

function RecentActivityPanel({ player }: { player: PlayerLookupResult }) {
  const { t } = useI18n();
  const [hoveredRole, setHoveredRole] = useState<ChampionTag | null>(null);
  const recentMatches = player.matches.slice(0, 20);
  const totalMatches = Math.max(recentMatches.length, 1);
  const roleStats = ROLE_ACTIVITY.map((role) => {
    const count = recentMatches.filter((match) => (match.championTags?.[0] ?? getFallbackChampionTag(match)) === role.tag).length;
    return {
      ...role,
      count,
      label: t(role.labelKey),
      percent: Math.round((count / totalMatches) * 100),
    };
  });

  return (
    <section className="lol-side-card lol-activity-panel">
      <h3>{t("player.recentActivity")}</h3>
      <span className="lol-activity-subtitle">{t("player.playedPercent")}</span>
      <div className="lol-activity-bars">
        {roleStats.map(({ icon: Icon, label, percent, count, tag }) => (
          <div
            className={`lol-activity-bar ${hoveredRole === tag ? "is-active" : ""}`}
            key={tag}
            onMouseEnter={() => setHoveredRole(tag)}
            onMouseLeave={() => setHoveredRole(null)}
          >
            {hoveredRole === tag && (
              <div className="lol-role-tooltip">
                <strong>{label}</strong>
                <span>{t("player.roleTooltipValue", { count, percent })}</span>
              </div>
            )}
            <i aria-label={`${label}: ${percent}%`}>
              <b style={{ height: `${Math.max(percent > 0 ? 6 : 0, Math.min(percent, 100))}%` }} />
            </i>
            <Icon className="h-5 w-5" />
            <small>{label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function getFallbackChampionTag(match: PlayerMatchItem): ChampionTag {
  const name = match.championName.toLowerCase();
  if (["lux", "viktor", "ahri", "veigar", "xerath", "brand", "syndra", "orianna"].includes(name)) return "Mage";
  if (["jhin", "ezreal", "caitlyn", "jinx", "lucian", "ashe", "kaisa", "miss fortune", "tristana"].includes(name)) return "Marksman";
  if (["pyke", "zed", "talon", "akali", "katarina", "fizz", "qiyana"].includes(name)) return "Assassin";
  if (["thresh", "lulu", "sona", "soraka", "nami", "yuumi", "milio"].includes(name)) return "Support";
  if (["malphite", "ornn", "sion", "nautilus", "leona", "rammus"].includes(name)) return "Tank";
  return "Fighter";
}

const MatchRow = forwardRef<HTMLElement, {
  match: PlayerMatchItem;
  active?: boolean;
  onClick?: () => void;
  onHover?: (id: string | null) => void;
}>(function MatchRow({
  match,
  active = false,
  onClick,
  onHover,
}, ref) {
  const { t } = useI18n();

  return (
    <article
      ref={ref}
      className={`match-row ${match.win ? "is-win" : "is-loss"} ${active ? "is-active" : ""}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onMouseEnter={() => onHover?.(match.id)}
      onMouseLeave={() => onHover?.(null)}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="match-champion">
        <img src={match.championIconUrl} alt={match.championName} loading="lazy" />
        <strong>{match.level}</strong>
      </div>
      <div className="match-result">
        <b>{match.win ? t("player.win") : t("player.loss")}</b>
        <span>{match.championName}</span>
      </div>
      <div className="match-kda">
        <strong>{match.kills} / {match.deaths} / {match.assists}</strong>
        <span>{match.kda.toFixed(2)} KDA</span>
      </div>
      <div className="match-assets">
        <div>
          {match.items.slice(0, 7).map((item, index) => <img key={`${match.id}-item-${index}`} src={item} alt="" loading="lazy" />)}
        </div>
        <div>
          {match.summonerSpells.map((spell, index) => <img key={`${match.id}-spell-${index}`} src={spell} alt="" loading="lazy" />)}
        </div>
      </div>
      <div className="match-meta">
        <span>{getQueueLabel(match, t)}</span>
        <small>{timeAgo(match.gameEndedAt, t)}</small>
        <small>{formatDuration(match.durationSeconds)}</small>
      </div>
    </article>
  );
});

MatchRow.displayName = "MatchRow";

function RecentPerformancePanel({
  matches,
  highlightedMatchId,
  onHover,
  onSelect,
  selectedMatchId,
}: {
  matches: PlayerMatchItem[];
  highlightedMatchId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  selectedMatchId: string | null;
}) {
  const { t } = useI18n();
  const wins = matches.filter((match) => match.win).length;
  const losses = matches.length - wins;
  const winrate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;
  const mvp = matches.filter((match) => match.isMvp).length;
  const ace = matches.filter((match) => match.isAce).length;
  const formScores = matches.map(getPerformanceScore);
  const averageScore = formScores.length > 0 ? Math.round(formScores.reduce((sum, score) => sum + score, 0) / formScores.length) : 0;
  const formStatus = getFormStatus(matches);

  return (
    <section className="player-data-panel recent-performance-panel form-timeline-card">
      <div className="form-timeline-head">
        <div>
          <h3>{t("player.recent20")}</h3>
          <span className={`form-status-badge ${formStatus.tone}`}>{t(formStatus.labelKey)}</span>
        </div>
        <span className="form-match-count">{t("player.matchesCount", { count: matches.length })}</span>
      </div>
      {matches.length > 0 ? (
        <>
          <PerformanceLineChart
            matches={matches}
            highlightedMatchId={highlightedMatchId}
            onHover={onHover}
            onSelect={onSelect}
            selectedMatchId={selectedMatchId}
          />
          <div className="performance-cards form-stat-grid">
            <KpiCard value={`${winrate}%`} label={t("player.winrate")} tone="green" />
            <KpiCard value={`${wins}W - ${losses}L`} label={t("player.result")} tone="mixed" />
            <KpiCard value={mvp} label="MVP" />
            <KpiCard value={ace} label="ACE" />
            <KpiCard value={averageScore} label={t("player.formAverage")} tone="mixed" />
          </div>
        </>
      ) : (
        <div className="player-empty-data">{t("player.noPerformanceData")}</div>
      )}
    </section>
  );
}

function PerformanceLineChart({
  matches,
  highlightedMatchId,
  onHover,
  onSelect,
  selectedMatchId,
}: {
  matches: PlayerMatchItem[];
  highlightedMatchId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  selectedMatchId: string | null;
}) {
  const { t } = useI18n();
  const width = 620;
  const height = 300;
  const paddingX = 38;
  const paddingTop = 28;
  const paddingBottom = 42;
  const chartHeight = height - paddingTop - paddingBottom;
  const points = [...matches].reverse().map((match, index, source) => {
    const score = getPerformanceScore(match);
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(source.length - 1, 1);
    const y = height - paddingBottom - (score / 100) * chartHeight;
    return { ...match, x, y, score };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = points.length > 0
    ? `${path} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : "";
  const activePoint = points.find((point) => point.id === highlightedMatchId || point.id === selectedMatchId);
  const tooltipWidth = 188;
  const tooltipHeight = 112;
  const tooltipX = activePoint ? Math.min(Math.max(activePoint.x + 14, 8), width - tooltipWidth - 8) : 0;
  const tooltipY = activePoint ? Math.max(8, activePoint.y - tooltipHeight - 14) : 0;

  return (
    <div className="form-chart-wrap">
      <svg className="performance-line-chart form-timeline-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={t("player.chartLabel")}>
        <defs>
          <linearGradient id="formLineGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="54%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#f5d986" />
          </linearGradient>
          <linearGradient id="formAreaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#4ade80" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect className="form-zone form-zone-carry" x="20" y={paddingTop} width={width - 40} height={chartHeight * 0.25} rx="12" />
        <rect className="form-zone form-zone-stable" x="20" y={paddingTop + chartHeight * 0.25} width={width - 40} height={chartHeight * 0.3} rx="12" />
        <rect className="form-zone form-zone-danger" x="20" y={paddingTop + chartHeight * 0.55} width={width - 40} height={chartHeight * 0.45} rx="12" />
        <text className="form-zone-label" x="30" y={paddingTop + 18}>{t("player.formCarry")}</text>
        <text className="form-zone-label" x="30" y={paddingTop + chartHeight * 0.25 + 20}>{t("player.formStable")}</text>
        <text className="form-zone-label" x="30" y={height - paddingBottom - 12}>{t("player.formDanger")}</text>

        {[0, 25, 50, 75, 100].map((value) => {
          const y = height - paddingBottom - (value / 100) * chartHeight;
          return <line key={value} className="form-grid-line" x1="20" x2={width - 20} y1={y} y2={y} />;
        })}
        {points.map((point) => <line key={`grid-${point.id}`} className="form-grid-line vertical" x1={point.x} x2={point.x} y1={paddingTop} y2={height - paddingBottom} />)}

        {areaPath && <path className="form-area-path" d={areaPath} />}
        <path className="form-line-shadow" d={path} />
        <path className="form-line-path" d={path} />
        {points.map((point, index) => (
          <g
            key={point.id}
            className="form-point-group"
            onMouseEnter={() => onHover(point.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(point.id)}
            tabIndex={0}
            role="button"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(point.id);
              }
            }}
          >
            <circle className="chart-hit-area" cx={point.x} cy={point.y} r="16" />
            {(point.isMvp || point.isAce) && (
              <circle
                className={`form-spotlight ${point.id === highlightedMatchId || point.id === selectedMatchId ? "is-highlighted" : ""}`}
                cx={point.x}
                cy={point.y}
                r="14"
              />
            )}
            <circle
              className={`rank-dot ${point.win ? "is-win" : "is-loss"} ${point.isMvp || point.isAce ? "is-standout" : ""} ${point.id === highlightedMatchId || point.id === selectedMatchId ? "is-highlighted" : ""}`}
              cx={point.x}
              cy={point.y}
              r={point.id === highlightedMatchId || point.id === selectedMatchId ? 8 : 5.5}
            />
            {(point.isMvp || point.isAce) && (
              <Crown className="form-crown-icon" x={point.x - 6} y={point.y - 24} width="12" height="12" />
            )}
            <text className="chart-index" x={point.x} y={height - 11}>{index + 1}</text>
          </g>
        ))}

        {activePoint && (
          <g className="form-chart-tooltip" transform={`translate(${tooltipX} ${tooltipY})`}>
            <rect width={tooltipWidth} height={tooltipHeight} rx="12" />
            <text className="tooltip-title" x="12" y="23">{activePoint.championName}</text>
            <text className={activePoint.win ? "tooltip-win" : "tooltip-loss"} x="12" y="43">
              {activePoint.win ? t("player.win") : t("player.loss")} - {activePoint.score} {t("player.formScoreShort")}
            </text>
            <text x="12" y="63">{activePoint.kills}/{activePoint.deaths}/{activePoint.assists} - {activePoint.kda.toFixed(2)} KDA</text>
            <text x="12" y="81">KP {activePoint.killParticipation}% - CS {activePoint.csPerMinute}</text>
            <text x="12" y="99">{timeAgo(activePoint.gameEndedAt, t)} - {activePoint.isMvp ? "MVP" : activePoint.isAce ? "ACE" : getQueueLabel(activePoint, t)}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function getPerformanceScore(match: PlayerMatchItem) {
  const score =
    40 +
    (match.win ? 20 : 0) +
    Math.min(match.kda * 6, 25) +
    Math.min(match.csPerMinute * 2, 15) +
    Math.min(match.killParticipation * 0.2, 15) +
    Math.min(match.damagePerMinute / 140, 10) +
    (match.isMvp || match.isAce ? 8 : 0);

  return Math.round(Math.max(0, Math.min(score, 100)));
}

function getCurrentStreak(matches: PlayerMatchItem[]) {
  if (matches.length === 0) return { type: "none" as const, count: 0 };
  const type = matches[0].win ? "win" : "loss";
  let count = 0;

  for (const match of matches) {
    if ((type === "win" && match.win) || (type === "loss" && !match.win)) {
      count += 1;
    } else {
      break;
    }
  }

  return { type, count };
}

function getFormStatus(matches: PlayerMatchItem[]) {
  const streak = getCurrentStreak(matches);
  if (streak.type === "win" && streak.count >= 3) {
    return { labelKey: "player.formWinStreak" as const, tone: "is-good" };
  }
  if (streak.type === "loss" && streak.count >= 3) {
    return { labelKey: "player.formLoseStreak" as const, tone: "is-danger" };
  }

  const recentFive = matches.slice(0, 5).map(getPerformanceScore);
  const previousFive = matches.slice(5, 10).map(getPerformanceScore);
  if (recentFive.length >= 5 && previousFive.length >= 5) {
    const recentAverage = recentFive.reduce((sum, score) => sum + score, 0) / recentFive.length;
    const previousAverage = previousFive.reduce((sum, score) => sum + score, 0) / previousFive.length;
    if (recentAverage - previousAverage >= 6) {
      return { labelKey: "player.formRising" as const, tone: "is-good" };
    }
    if (previousAverage - recentAverage >= 6) {
      return { labelKey: "player.formFalling" as const, tone: "is-danger" };
    }
  }

  const wins = matches.filter((match) => match.win).length;
  const winrate = matches.length > 0 ? (wins / matches.length) * 100 : 0;
  if (winrate >= 65) return { labelKey: "player.formHigh" as const, tone: "is-good" };
  if (winrate >= 50) return { labelKey: "player.formStableStatus" as const, tone: "is-stable" };
  return { labelKey: "player.formNeedsWork" as const, tone: "is-danger" };
}

function KpiCard({ value, label, tone }: { value: number | string; label: string; tone?: "green" | "mixed" }) {
  return (
    <div className={`kpi-card ${tone ?? ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function MatchDetailPanel({ match }: { match?: PlayerMatchItem }) {
  const { t } = useI18n();

  if (!match) {
    return (
      <section className="player-data-panel match-detail-card">
        <h3>{t("player.matchDetail")}</h3>
        <div className="player-empty-data">{t("player.matchDetailEmpty")}</div>
      </section>
    );
  }

  return (
    <section className={`player-data-panel match-detail-card ${match.win ? "is-win" : "is-loss"}`}>
      <div className="match-detail-head">
        <img src={match.championIconUrl} alt={match.championName} loading="lazy" />
        <div>
          <h3>{t(match.win ? "player.victoryWith" : "player.defeatWith", { champion: match.championName })}</h3>
          <span>{getQueueLabel(match, t)} · {timeAgo(match.gameEndedAt, t)} · {formatDuration(match.durationSeconds)}</span>
        </div>
      </div>
      <div className="detail-stat-grid">
        <KpiCard value={`${match.kills}/${match.deaths}/${match.assists}`} label="K/D/A" />
        <KpiCard value={match.kda.toFixed(2)} label="KDA" />
        <KpiCard value={match.csPerMinute} label={t("player.csPerMinute")} />
        <KpiCard value={`${match.killParticipation}%`} label="KP" />
      </div>
      <div className="match-detail-items">
        {match.items.map((item, index) => <img key={`${match.id}-detail-${index}`} src={item} alt="" loading="lazy" />)}
      </div>
    </section>
  );
}

function ChampionStatsModal({
  mode,
  champions,
  onClose,
}: {
  mode: ChampionModalMode;
  champions: PlayerChampionStat[];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const sortedChampions = [...champions].sort((a, b) =>
    mode === "played" ? b.games - a.games || b.winrate - a.winrate : b.winrate - a.winrate || b.games - a.games
  );
  const title = mode === "played" ? t("player.modalPlayedLabel") : t("player.modalWinrateLabel");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="champion-modal-backdrop" onClick={onClose}>
      <div
        className="champion-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="champion-modal-head">
          <div>
            <span>{mode === "played" ? t("player.modalPlayedKicker") : t("player.modalWinrateKicker")}</span>
            <h3>{title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label={t("common.close")}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="champion-modal-list">
          {sortedChampions.length > 0 ? (
            sortedChampions.map((champion, index) => (
              <div className="champion-modal-row" key={champion.championKey}>
                <span>{index + 1}</span>
                <img src={champion.championIconUrl} alt={champion.championName} loading="lazy" />
                <strong>{champion.championName}</strong>
                <em>{t("player.matchesCount", { count: champion.games })}</em>
                <em>{t("player.winPercent", { value: champion.winrate })}</em>
                <em>{champion.wins}W</em>
                <em>{champion.kda.toFixed(2)} KDA</em>
              </div>
            ))
          ) : (
            <div className="player-empty-data">{t("player.noModalData")}</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function filterMatches(matches: PlayerMatchItem[], filter: MatchFilter) {
  if (filter === "all") return matches;
  return matches.filter((match) => match.queueGroup === filter);
}

function getQueueLabel(match: PlayerMatchItem, t: ReturnType<typeof useI18n>["t"]) {
  if (match.queueGroup === "solo") return t("player.rankedSoloDuo");
  if (match.queueGroup === "flex") return t("player.rankedFlex");
  if (match.queueGroup === "normal") return t("player.normalQueue");
  return match.queueName;
}

function getRankEmblemUrl(tier?: string) {
  const normalizedTier = tier?.toLowerCase() ?? "iron";
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${normalizedTier}.png`;
}

function getRankColor(tier?: string) {
  const colors: Record<string, string> = {
    IRON: "#9ca3af",
    BRONZE: "#c08457",
    SILVER: "#cbd5e1",
    GOLD: "#fbbf24",
    PLATINUM: "#34d399",
    EMERALD: "#4ade80",
    DIAMOND: "#8b5cf6",
    MASTER: "#d946ef",
    GRANDMASTER: "#ef4444",
    CHALLENGER: "#facc15",
  };
  return tier ? colors[tier] ?? "#cbd5e1" : "#9ca3af";
}

function formatRank(rank: RankInfo | undefined, t: ReturnType<typeof useI18n>["t"]) {
  if (!rank) return t("player.unranked");
  return `${t(`rank.${rank.tier}` as Parameters<typeof t>[0])} ${rank.rank ?? ""}`.trim();
}

function timeAgo(timestamp: number, t: ReturnType<typeof useI18n>["t"]) {
  const diffHours = Math.max(1, Math.round((Date.now() - timestamp) / 3600000));
  if (diffHours < 24) return t("player.hoursAgo", { hours: diffHours });
  return diffHours < 48 ? t("player.yesterday") : t("player.daysAgo", { days: Math.round(diffHours / 24) });
}

function formatMatchDate(timestamp: number) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
