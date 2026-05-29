import type { Champion } from "./champion";

export type LaneId = "top" | "jungle" | "mid" | "ad" | "sp";

export type BuildAsset = {
  id: string;
  name: string;
  iconUrl: string;
};

export type ChampionPick = {
  pickId: string;
  lane: LaneId;
  champion: Champion;
  spells: BuildAsset[];
  items: BuildAsset[];
  boots: BuildAsset;
};

export type TeamResult = {
  id: string;
  name: string;
  side: "blue" | "red";
  picks: ChampionPick[];
};

export type HistoryKind = "one-card" | "one-team" | "two-team";

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  title: string;
  createdAt: string;
  summary: string;
  payload: unknown;
};
