"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import { Crosshair, Gem, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { Champion } from "@/types/champion";
import type { ChampionPick } from "@/types/random";
import { shuffle } from "@/utils/random";

type ChampionRouletteProps = {
  champions: Champion[];
  isRolling: boolean;
  onComplete: (pick: ChampionPick) => void;
  targetPick?: ChampionPick;
};

const TARGET_INDEX = 42;
const REEL_LENGTH = 54;
const SPIN_DURATION_SECONDS = 6.5;

export function ChampionRoulette({ champions, isRolling, onComplete, targetPick }: ChampionRouletteProps) {
  const { t } = useI18n();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const completedPickId = useRef<string | undefined>(undefined);
  const x = useMotionValue(0);
  const [lockedPickId, setLockedPickId] = useState<string>();
  const [countdown, setCountdown] = useState(0);

  const reel = useMemo(() => {
    if (!targetPick || champions.length === 0) {
      return champions.slice(0, 18);
    }

    const filler = shuffle(champions.filter((champion) => champion.id !== targetPick.champion.id));
    const nextReel = Array.from({ length: REEL_LENGTH }, (_, index) => filler[index % filler.length]);
    nextReel[TARGET_INDEX] = targetPick.champion;
    return nextReel;
  }, [champions, targetPick]);

  useEffect(() => {
    if (isRolling || targetPick) return;

    completedPickId.current = undefined;
    setLockedPickId(undefined);
    x.set(0);
  }, [isRolling, targetPick, x]);

  useEffect(() => {
    if (isRolling || !targetPick || !viewportRef.current) return;

    const viewport = viewportRef.current;
    const targetItem = trackRef.current?.querySelector<HTMLElement>(`[data-roulette-index="${TARGET_INDEX}"]`);
    if (!targetItem) return;

    const pointerCenter = viewport.clientWidth / 2;
    const targetCenter = targetItem.offsetLeft + targetItem.offsetWidth / 2;
    x.set(pointerCenter - targetCenter);
    completedPickId.current = targetPick.pickId;
    setLockedPickId(targetPick.pickId);
  }, [isRolling, targetPick, reel, x]);

  useEffect(() => {
    if (!isRolling || !targetPick || !viewportRef.current) return;

    completedPickId.current = undefined;
    setLockedPickId(undefined);
    setCountdown(SPIN_DURATION_SECONDS);
    x.set(0);

    const viewport = viewportRef.current;
    const targetItem = trackRef.current?.querySelector<HTMLElement>(`[data-roulette-index="${TARGET_INDEX}"]`);
    if (!targetItem) return;

    const pointerCenter = viewport.clientWidth / 2;
    const targetCenter = targetItem.offsetLeft + targetItem.offsetWidth / 2;
    const finalX = pointerCenter - targetCenter;

    const controls = animate(x, finalX, {
      duration: SPIN_DURATION_SECONDS,
      ease: [0.08, 0.82, 0.16, 1],
      onComplete: () => {
        if (completedPickId.current === targetPick.pickId) return;
        completedPickId.current = targetPick.pickId;
        setLockedPickId(targetPick.pickId);
        setCountdown(0);
        onComplete(targetPick);
      },
    });

    return () => controls.stop();
  }, [isRolling, onComplete, targetPick, x]);

  useEffect(() => {
    if (!isRolling) return;

    const startedAt = performance.now();
    let frame = 0;

    function tick(now: number) {
      const elapsed = (now - startedAt) / 1000;
      const remaining = Math.max(0, SPIN_DURATION_SECONDS - elapsed);
      setCountdown(remaining);
      if (remaining > 0) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [isRolling]);

  return (
    <section className={`champion-roulette ${isRolling ? "is-rolling" : ""} ${lockedPickId ? "is-locked" : ""}`}>
      <div className="roulette-ambient" aria-hidden />
      <div className="roulette-head">
        <div>
          <p className="screen-kicker">{t("roulette.kicker")}</p>
          <h3>{t("roulette.title")}</h3>
        </div>
        <div className="roulette-state">
          {isRolling ? (
            <>
              <Crosshair className="h-4 w-4" />
              {t("roulette.rolling")}
            </>
          ) : lockedPickId ? (
            <>
              <Sparkles className="h-4 w-4" />
              {t("roulette.locked")}
            </>
          ) : (
            t("roulette.ready")
          )}
        </div>
      </div>

      <div className="roulette-window" ref={viewportRef}>
        <div className="roulette-light-sweep" aria-hidden />
        <div className="roulette-pointer crystal-lock" aria-hidden>
          <span className="crystal-orbit" />
          <span className="crystal-core">
            <Gem className="h-6 w-6" />
          </span>
          <span className="crystal-beam" />
          <span className="crystal-scan" />
        </div>
        <motion.div className="roulette-track" ref={trackRef} style={{ x }}>
          {reel.map((champion, index) => {
            const isTarget = targetPick?.champion.id === champion.id && index === TARGET_INDEX;
            const isLocked = lockedPickId === targetPick?.pickId && isTarget;

            return (
              <div
                key={`${champion.id}-${index}-${targetPick?.pickId ?? "idle"}`}
                className={`roulette-item ${isLocked ? "is-locked" : ""}`}
                data-roulette-index={index}
              >
                <img className="roulette-item-art" src={champion.loadingUrl} alt={champion.name} loading="lazy" />
                <span className="roulette-item-glass" />
                <img className="roulette-item-icon" src={champion.squareUrl} alt="" loading="lazy" />
                <strong>{champion.name}</strong>
              </div>
            );
          })}
        </motion.div>
        <div className="roulette-center-line" />
      </div>
    </section>
  );
}
