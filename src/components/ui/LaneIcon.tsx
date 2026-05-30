import { Crosshair, ShieldPlus, Sparkles, Swords, Trees } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LaneId } from "@/types/random";

type LaneIconKey = LaneId | "TOP" | "JGL" | "MID" | "AD" | "SP" | "jgl" | "adc" | "support";

const laneIcons: Partial<Record<LaneIconKey, LucideIcon>> = {
  TOP: Swords,
  JGL: Trees,
  MID: Sparkles,
  AD: Crosshair,
  SP: ShieldPlus,
  top: Swords,
  jungle: Trees,
  jgl: Trees,
  mid: Sparkles,
  adc: Crosshair,
  ad: Crosshair,
  support: ShieldPlus,
  sp: ShieldPlus,
};

export function LaneIcon({
  className = "lane-icon-svg",
  lane,
}: {
  className?: string;
  lane: LaneIconKey | string;
}) {
  const normalizedLaneKey = lane.toString().toLowerCase() as LaneIconKey;
  const Icon = laneIcons[lane as LaneIconKey] || laneIcons[normalizedLaneKey] || Sparkles;

  return <Icon aria-hidden className={className} strokeWidth={2.5} />;
}
