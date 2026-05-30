"use client";

import { FormEvent, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PlayerChampionBanner } from "@/components/player/PlayerChampionBanner";
import { REGIONS } from "@/constants/regions";
import { useI18n } from "@/i18n/I18nProvider";
import type { PlatformRegion, PlayerLookupResult } from "@/types/player";

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: PlayerLookupResult }
  | { status: "error"; message: string; code?: string };

type PlayerLookupProps = {
  defaultRegion: PlatformRegion;
};

const INVISIBLE_RIOT_ID_CHARS = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

function normalizeRiotIdInput(value: string) {
  return value
    .replace(INVISIBLE_RIOT_ID_CHARS, "")
    .replace("＃", "#")
    .replace(/\s*#\s*/g, "#")
    .trim();
}

export function PlayerLookup({ defaultRegion }: PlayerLookupProps) {
  const { language, t } = useI18n();
  const [riotId, setRiotId] = useState("");
  const [region, setRegion] = useState<PlatformRegion>(defaultRegion);
  const [state, setState] = useState<LookupState>({ status: "idle" });

  useEffect(() => {
    setRegion(defaultRegion);
  }, [defaultRegion]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedRiotId = normalizeRiotIdInput(riotId);
    setRiotId(normalizedRiotId);
    setState({ status: "loading" });

    const response = await fetch(`/api/player?riotId=${encodeURIComponent(normalizedRiotId)}&region=${region}&locale=${language}`);
    const data = await response.json();

    if (!response.ok) {
      setState({ status: "error", message: data.message ?? t("player.errorFallback"), code: data.code });
      return;
    }

    setState({ status: "success", data });
  }

  return (
    <div className="player-lookup-shell">
      <section className="workspace-panel player-search-panel player-search-bar">
        <div>
          <p className="screen-kicker">{t("player.kicker")}</p>
          <h2>{t("player.title")}</h2>
        </div>

        <form onSubmit={handleSubmit} className="lookup-form">
          <input
            value={riotId}
            onChange={(event) => setRiotId(event.target.value)}
            placeholder={t("player.searchPlaceholder")}
            className="field big-field"
          />
          <select value={region} onChange={(event) => setRegion(event.target.value as PlatformRegion)} className="field">
            {REGIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button className="mega-button" disabled={state.status === "loading" || !riotId.trim()}>
            <Search className={`h-5 w-5 ${state.status === "loading" ? "animate-spin" : ""}`} />
            {state.status === "loading" ? t("player.searching") : t("player.search")}
          </button>
        </form>
      </section>

      <section className="workspace-panel player-result-stage">
        <PlayerChampionBanner
          loading={state.status === "loading"}
          error={state.status === "error" ? { message: state.message, code: state.code } : undefined}
          player={state.status === "success" ? state.data : undefined}
        />
      </section>
    </div>
  );
}
