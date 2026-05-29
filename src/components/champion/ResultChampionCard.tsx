"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Gem, Sparkles, WandSparkles } from "lucide-react";
import { useRef } from "react";
import { AssetIcon } from "@/components/ui/AssetIcon";
import { LANE_BY_ID } from "@/constants/lanes";
import { useI18n } from "@/i18n/I18nProvider";
import { getLaneLabel } from "@/i18n/laneLabels";
import type { ChampionPick } from "@/types/random";

type ResultChampionCardProps = {
  pick: ChampionPick;
  density?: "showcase" | "slot";
  index?: number;
};

export function ResultChampionCard({ pick, density = "slot", index = 0 }: ResultChampionCardProps) {
  const { language, t } = useI18n();
  const lane = LANE_BY_ID[pick.lane];
  const laneLabel = getLaneLabel(language, pick.lane);
  const isShowcase = density === "showcase";
  const cardRef = useRef<HTMLElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!isShowcase || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mx", `${x}%`);
    cardRef.current.style.setProperty("--my", `${y}%`);
  }

  return (
    <motion.article
      ref={cardRef}
      layout
      initial={
        isShowcase
          ? { opacity: 0, y: 52, scale: 0.82, rotateX: 8, filter: "brightness(2.2)" }
          : { opacity: 0, y: 20, scale: 0.96 }
      }
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "brightness(1)" }}
      transition={{ duration: isShowcase ? 0.72 : 0.42, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`result-card ${isShowcase ? "is-showcase" : "is-slot"}`}
      onPointerMove={handlePointerMove}
    >
      <img
        src={isShowcase ? pick.champion.splashUrl : pick.champion.loadingUrl}
        alt={pick.champion.name}
        loading="lazy"
        className={`result-card-media ${isShowcase ? "is-showcase-media" : ""}`}
      />
      <div className="result-card-shade" />

      {isShowcase && (
        <>
          <div className="reward-burst" aria-hidden />
          <div className="reward-shine" aria-hidden />
          <div className="reward-particles" aria-hidden>
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </>
      )}

      <div className="result-card-top">
        <span className={`lane-token bg-gradient-to-r ${lane.color}`}>
          <span>{lane.icon}</span>
          {lane.shortLabel}
        </span>
        <span className="lock-token">
          <CheckCircle2 className="h-4 w-4" />
          {t("result.lock")}
        </span>
      </div>

      <div className="result-card-body">
        <div className="result-title-row">
          <div>
            <p className="card-kicker">{laneLabel}</p>
            <h3>{pick.champion.name}</h3>
            {isShowcase && <span>{pick.champion.title}</span>}
          </div>
          {isShowcase && <Sparkles className="h-7 w-7 text-[color:var(--gold-soft)]" />}
        </div>

        {isShowcase && (
          <div className="reward-meta-row">
            <span>
              <Gem className="h-4 w-4" />
              {pick.champion.tags.join(" / ")}
            </span>
            <span>
              <WandSparkles className="h-4 w-4" />
              {t("one.difficulty")} {getDifficultyLabel(pick.champion.key)}
            </span>
            <span>{t("result.rune")}</span>
          </div>
        )}

        <div className="build-grid">
          <div>
            <p>{t("result.summonerSpells")}</p>
            <div className="asset-row">
              {pick.spells.map((spell) => (
                <AssetIcon key={spell.id} src={spell.iconUrl} alt={spell.name} />
              ))}
            </div>
          </div>
          <div>
            <p>{t("result.items")}</p>
            <div className="asset-row">
              {pick.items.map((item) => (
                <AssetIcon key={item.id} src={item.iconUrl} alt={item.name} size="sm" />
              ))}
              <AssetIcon src={pick.boots.iconUrl} alt={pick.boots.name} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function getDifficultyLabel(key: string) {
  const value = Number(key) % 3;
  if (value === 0) return "III";
  if (value === 1) return "II";
  return "I";
}
