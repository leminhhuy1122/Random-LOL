export type ChampionTag = "Assassin" | "Fighter" | "Mage" | "Marksman" | "Support" | "Tank";

export type Champion = {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  tags: ChampionTag[];
  squareUrl: string;
  splashUrl: string;
  loadingUrl: string;
};

export type ChampionApiResponse = {
  version: string;
  champions: Champion[];
};
