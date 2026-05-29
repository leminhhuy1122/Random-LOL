import type { LaneId } from "@/types/random";

export type LaneMeta = {
  id: LaneId;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
};

export const LANES: LaneMeta[] = [
  { id: "top", label: "Top Lane", shortLabel: "TOP", icon: "^", color: "from-amber-400 to-orange-600" },
  { id: "jungle", label: "Jungle", shortLabel: "JGL", icon: "*", color: "from-emerald-400 to-lime-600" },
  { id: "mid", label: "Mid Lane", shortLabel: "MID", icon: "D", color: "from-sky-300 to-blue-600" },
  { id: "ad", label: "Bot Carry", shortLabel: "AD", icon: "O", color: "from-rose-300 to-red-600" },
  { id: "sp", label: "Support", shortLabel: "SP", icon: "+", color: "from-violet-300 to-indigo-600" },
];

export const LANE_BY_ID = Object.fromEntries(LANES.map((lane) => [lane.id, lane])) as Record<LaneId, LaneMeta>;
