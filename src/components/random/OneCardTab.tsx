"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Dices,
  Footprints,
  Gem,
  Radio,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Swords,
  WandSparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ResultChampionCard } from "@/components/champion/ResultChampionCard";
import { ChampionRoulette } from "@/components/random/ChampionRoulette";
import { AssetIcon } from "@/components/ui/AssetIcon";
import { LANE_BY_ID } from "@/constants/lanes";
import { useI18n } from "@/i18n/I18nProvider";
import { getLaneLabel } from "@/i18n/laneLabels";
import type { Champion } from "@/types/champion";
import type { ChampionPick } from "@/types/random";

type OneCardTabProps = {
  champions: Champion[];
  disabled: boolean;
  isAudioPlaying: boolean;
  isRolling: boolean;
  onRandom: () => void;
  onRevealClose: () => void;
  onRouletteComplete: (pick: ChampionPick) => void;
  pendingPick?: ChampionPick;
  pick?: ChampionPick;
  revealingPick?: ChampionPick;
  version: string;
};

export function OneCardTab({
  champions,
  disabled,
  isAudioPlaying,
  isRolling,
  onRandom,
  onRevealClose,
  onRouletteComplete,
  pendingPick,
  pick,
  revealingPick,
  version,
}: OneCardTabProps) {
  const { t } = useI18n();

  return (
    <div className={`one-card-cinematic ${isRolling ? "is-spinning" : ""} ${revealingPick ? "is-revealing" : ""}`}>
      <div className="cinematic-bg-layers" aria-hidden>
        <span className="energy-wisp one" />
        <span className="energy-wisp two" />
        <span className="energy-wisp three" />
        <span className="rune-orbit rune-a">+</span>
        <span className="rune-orbit rune-b">*</span>
        <span className="rune-orbit rune-c">x</span>
      </div>

      <header className="rift-mini-header">
        <div className="rift-title-lockup">
          <div className="rift-logo-core">R</div>
          <div>
            <p className="screen-kicker">{t("one.kicker")}</p>
            <h2>{t("one.title")}</h2>
          </div>
        </div>
        <div className="rift-mini-metrics">
          <span>
            <ShieldCheck className="h-4 w-4" />
            {t("app.patch", { version })}
          </span>
          <span>
            <Activity className="h-4 w-4" />
            {t("one.champs", { count: champions.length })}
          </span>
          <span>
            <Radio className="h-4 w-4" />
            {t("one.live")}
          </span>
        </div>
      </header>

      <section className="rift-stage rift-stage-vertical">
        <LockedResultVault pick={pick} isRolling={isRolling} />

        <div className="roulette-drop-arrow" aria-hidden>
          <ChevronDown className="h-8 w-8" />
        </div>

        <div className="roulette-command-panel">
          <ChampionRoulette
            champions={champions}
            isRolling={isRolling}
            onComplete={onRouletteComplete}
            targetPick={pendingPick}
          />

          <div className="spin-dock">
            <button className={`rift-roll-button ${isRolling ? "is-rolling" : ""}`} disabled={disabled || isRolling} onClick={onRandom}>
              {isRolling ? <RefreshCcw className="h-6 w-6 animate-spin" /> : <Dices className="h-6 w-6" />}
              <span>{isRolling ? t("one.spinning") : isAudioPlaying ? t("one.audio") : t("one.spin")}</span>
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {revealingPick && <CinematicRevealOverlay key={revealingPick.pickId} pick={revealingPick} onClose={onRevealClose} />}
      </AnimatePresence>
    </div>
  );
}

function LockedResultVault({ pick, isRolling }: { pick?: ChampionPick; isRolling: boolean }) {
  const { language, t } = useI18n();

  if (!pick) {
    return (
      <section className="result-vault result-vault-empty">
        <div className="result-vault-aura" aria-hidden />
        <div className="result-vault-placeholder">
          <div className="question-core">?</div>
          <p className="screen-kicker">{isRolling ? t("one.rollingKicker") : t("one.emptyKicker")}</p>
          <h3>{isRolling ? t("one.rollingTitle") : t("one.emptyTitle")}</h3>
          <span>{t("one.emptyCopy")}</span>
        </div>
      </section>
    );
  }

  const lane = LANE_BY_ID[pick.lane];
  const laneLabel = getLaneLabel(language, pick.lane);

  return (
    <section className="result-vault has-result">
      <img className="result-vault-art" src={pick.champion.splashUrl} alt={pick.champion.name} loading="lazy" />
      <div className="result-vault-shade" />
      <div className="result-vault-aura" aria-hidden />
      <div className="result-vault-content">
        <div className="result-vault-status">
          <span className={`lane-token bg-gradient-to-r ${lane.color}`}>
            <span>{lane.icon}</span>
            {lane.shortLabel}
          </span>
          <span className="lock-token">
            <CheckCircle2 className="h-4 w-4" />
            {t("one.locked")}
          </span>
        </div>
        <div className="result-vault-main">
          <div className="vault-identity">
            <p className="card-kicker">{t("one.lastReward")}</p>
            <h3>{pick.champion.name}</h3>
            <span>{pick.champion.title}</span>
            <div className="vault-meta-pills">
              <span>
                <Sparkles className="h-4 w-4" />
                {pick.champion.tags[0] ?? "Champion"}
              </span>
              <span>{laneLabel}</span>
              <span>{t("one.difficulty")}: {getDifficultyLabel(pick.champion.key)}</span>
            </div>
          </div>
        </div>

        <div className="vault-reward-panels">
          <RewardPanel icon={WandSparkles} title={t("one.spells")}>
            <div className="asset-row">
              {pick.spells.map((spell) => (
                <AssetIcon key={spell.id} src={spell.iconUrl} alt={spell.name} />
              ))}
            </div>
          </RewardPanel>
          <RewardPanel icon={Swords} title={t("one.items")}>
            <div className="asset-row">
              {pick.items.map((item) => (
                <AssetIcon key={item.id} src={item.iconUrl} alt={item.name} />
              ))}
            </div>
          </RewardPanel>
          <RewardPanel icon={Footprints} title={t("one.boots")}>
            <div className="asset-row">
              <AssetIcon src={pick.boots.iconUrl} alt={pick.boots.name} />
            </div>
          </RewardPanel>
          <RewardPanel icon={Gem} title={t("one.tags")}>
            <div className="vault-tag-row">
              {pick.champion.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
              <span>{lane.shortLabel}</span>
            </div>
          </RewardPanel>
        </div>
      </div>
    </section>
  );
}

function RewardPanel({ children, icon: Icon, title }: { children: React.ReactNode; icon: LucideIcon; title: string }) {
  return (
    <div className="vault-reward-panel">
      <div className="vault-panel-emblem" aria-hidden>
        <Icon className="h-7 w-7" />
      </div>
      <p>{title}</p>
      {children}
    </div>
  );
}

function getDifficultyLabel(key: string) {
  const value = Number(key) % 3;
  if (value === 0) return "III";
  if (value === 1) return "II";
  return "I";
}

function CinematicRevealOverlay({ pick, onClose }: { pick: ChampionPick; onClose: () => void }) {
  const { language, t } = useI18n();
  const lane = LANE_BY_ID[pick.lane];

  return (
    <motion.div
      className="reward-reveal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${pick.champion.name} reward reveal`}
      onClick={onClose}
    >
      <img className="reward-reveal-backdrop" src={pick.champion.splashUrl} alt="" aria-hidden />
      <div className="reward-reveal-vignette" aria-hidden />
      <div className="reward-reveal-flash" aria-hidden />
      <div className="reward-reveal-portal" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="reward-reveal-shards" aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <button className="reveal-close-button" type="button" onClick={onClose} aria-label={t("one.closeReveal")}>
        <X className="h-5 w-5" />
      </button>

      <motion.div
        className="reward-reveal-card-shell"
        initial={{ opacity: 0, scale: 0.52, y: 90, rotateX: 18, filter: "brightness(2.8) blur(6px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, filter: "brightness(1) blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ duration: 0.86, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="reward-ssr-label">
          <Sparkles className="h-4 w-4" />
          {t("one.reveal")}
        </div>
        <ResultChampionCard pick={pick} density="showcase" />
        <div className={`reveal-position-badge bg-gradient-to-r ${lane.color}`} aria-label={`${t("one.position")} ${getLaneLabel(language, pick.lane)}`}>
          <span>{lane.icon}</span>
          <div>
            <small>{t("one.position")}</small>
            <strong>{lane.shortLabel}</strong>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
