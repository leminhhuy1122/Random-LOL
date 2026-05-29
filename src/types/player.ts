export type PlatformRegion =
  | "VN2"
  | "KR"
  | "JP1"
  | "NA1"
  | "EUW1"
  | "EUN1"
  | "SG2"
  | "TH2"
  | "TW2"
  | "PH2"
  | "BR1"
  | "LA1"
  | "LA2"
  | "OC1"
  | "TR1"
  | "RU";

export type RankInfo = {
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export type TopChampionMastery = {
  id: number;
  key: string;
  name: string;
  splashUrl: string;
  masteryLevel: number;
  championPoints: number;
};

export type PlayerMatchItem = {
  id: string;
  championKey: string;
  championName: string;
  championIconUrl: string;
  level: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  cs: number;
  csPerMinute: number;
  damagePerMinute: number;
  killParticipation: number;
  goldEarned: number;
  queueName: string;
  queueId: number;
  queueGroup: "solo" | "flex" | "normal" | "aram" | "other";
  gameEndedAt: number;
  durationSeconds: number;
  items: string[];
  summonerSpells: string[];
  isMvp: boolean;
  isAce: boolean;
};

export type PlayerChampionStat = {
  championKey: string;
  championName: string;
  championIconUrl: string;
  games: number;
  wins: number;
  winrate: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
};

export type PlayerPerformanceSummary = {
  games: number;
  wins: number;
  losses: number;
  winrate: number;
  kda: number;
  kills: number;
  deaths: number;
  assists: number;
  csPerMinute: number;
  damagePerMinute: number;
  killParticipation: number;
  mvp: number;
  ace: number;
};

export type PlayerPerformanceAnalysis = {
  combat: number;
  attack: number;
  vision: number;
  objective: number;
  farm: number;
};

export type PlayerLookupResult = {
  riotId: string;
  region: PlatformRegion;
  profileIconUrl: string;
  level: number;
  soloRank?: RankInfo;
  flexRank?: RankInfo;
  topChampion?: TopChampionMastery;
  matches: PlayerMatchItem[];
  championStats: PlayerChampionStat[];
  mostPlayedChampions: PlayerChampionStat[];
  bestWinrateChampions: PlayerChampionStat[];
  performance: PlayerPerformanceSummary;
  analysis: PlayerPerformanceAnalysis;
};
