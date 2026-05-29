import type { PlatformRegion } from "@/types/player";

export const REGIONS: PlatformRegion[] = [
  "VN2",
  "KR",
  "JP1",
  "NA1",
  "EUW1",
  "EUN1",
  "SG2",
  "TH2",
  "TW2",
  "PH2",
  "BR1",
  "LA1",
  "LA2",
  "OC1",
  "TR1",
  "RU"
];

export const ACCOUNT_ROUTE_BY_REGION: Record<PlatformRegion, "americas" | "asia" | "europe" | "sea"> = {
  VN2: "asia",
  SG2: "asia",
  TH2: "asia",
  TW2: "asia",
  PH2: "asia",
  OC1: "asia",
  KR: "asia",
  JP1: "asia",
  NA1: "americas",
  BR1: "americas",
  LA1: "americas",
  LA2: "americas",
  EUW1: "europe",
  EUN1: "europe",
  TR1: "europe",
  RU: "europe"
};

export const MATCH_ROUTE_BY_REGION: Record<PlatformRegion, "americas" | "asia" | "europe" | "sea"> = {
  VN2: "sea",
  SG2: "sea",
  TH2: "sea",
  TW2: "sea",
  PH2: "sea",
  OC1: "sea",
  KR: "asia",
  JP1: "asia",
  NA1: "americas",
  BR1: "americas",
  LA1: "americas",
  LA2: "americas",
  EUW1: "europe",
  EUN1: "europe",
  TR1: "europe",
  RU: "europe"
};
