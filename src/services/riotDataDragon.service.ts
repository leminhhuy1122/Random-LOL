import type { Champion, ChampionApiResponse } from "@/types/champion";
import { DATA_DRAGON_REVALIDATE_SECONDS } from "@/utils/cache";

type DataDragonChampion = {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  tags: Champion["tags"];
};

type DataDragonChampionResponse = {
  data: Record<string, DataDragonChampion>;
};

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
const SUPPORTED_LOCALES = new Set(["en_US", "vi_VN"]);
const SPELL_ASSET_BY_ID: Record<number, string> = {
  1: "SummonerBoost",
  3: "SummonerExhaust",
  4: "SummonerFlash",
  6: "SummonerHaste",
  7: "SummonerHeal",
  11: "SummonerSmite",
  12: "SummonerTeleport",
  13: "SummonerMana",
  14: "SummonerDot",
  21: "SummonerBarrier",
  32: "SummonerSnowball",
  39: "SummonerSnowURFSnowball",
  54: "Summoner_UltBookPlaceholder",
  55: "Summoner_UltBookSmitePlaceholder"
};

export function getChampionSplashUrl(championKey: string) {
  return `${DDRAGON_BASE}/cdn/img/champion/splash/${championKey}_0.jpg`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: DATA_DRAGON_REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    throw new Error(`Data Dragon error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getLatestDataDragonVersion() {
  const versions = await fetchJson<string[]>(`${DDRAGON_BASE}/api/versions.json`);
  return versions[0];
}

function normalizeLocale(locale?: string | null) {
  return locale && SUPPORTED_LOCALES.has(locale) ? locale : "en_US";
}

export async function getChampionData(locale?: string | null): Promise<ChampionApiResponse> {
  const version = await getLatestDataDragonVersion();
  const normalizedLocale = normalizeLocale(locale);
  let data: DataDragonChampionResponse;

  try {
    data = await fetchJson<DataDragonChampionResponse>(
      `${DDRAGON_BASE}/cdn/${version}/data/${normalizedLocale}/champion.json`
    );
  } catch {
    data = await fetchJson<DataDragonChampionResponse>(
      `${DDRAGON_BASE}/cdn/${version}/data/en_US/champion.json`
    );
  }

  const champions = Object.values(data.data)
    .map<Champion>((champion) => ({
      id: champion.id,
      key: champion.key,
      name: champion.name,
      title: champion.title,
      blurb: champion.blurb,
      tags: champion.tags,
      squareUrl: `${DDRAGON_BASE}/cdn/${version}/img/champion/${champion.id}.png`,
      splashUrl: `${DDRAGON_BASE}/cdn/img/champion/splash/${champion.id}_0.jpg`,
      loadingUrl: `${DDRAGON_BASE}/cdn/img/champion/loading/${champion.id}_0.jpg`
    }))
    .sort((a, b) => a.name.localeCompare(b.name, normalizedLocale === "vi_VN" ? "vi" : "en"));

  return { version, champions };
}

export async function getChampionIdentityByNumericKey(version: string, championId: number) {
  const championMap = await getChampionIdentityMap(version);
  const champion = championMap.get(championId);

  if (!champion) {
    return undefined;
  }

  return champion;
}

export async function getChampionIdentityMap(version: string) {
  const data = await fetchJson<DataDragonChampionResponse>(
    `${DDRAGON_BASE}/cdn/${version}/data/en_US/champion.json`
  );

  return new Map(
    Object.values(data.data).map((champion) => [
      Number(champion.key),
      {
        key: champion.id,
        name: champion.name,
        tags: champion.tags,
        iconUrl: `${DDRAGON_BASE}/cdn/${version}/img/champion/${champion.id}.png`,
        splashUrl: getChampionSplashUrl(champion.id)
      }
    ])
  );
}

export function getItemIconUrl(version: string, itemId: number) {
  return itemId > 0 ? `${DDRAGON_BASE}/cdn/${version}/img/item/${itemId}.png` : "";
}

export function getSummonerSpellIconUrl(version: string, spellId: number) {
  const assetId = SPELL_ASSET_BY_ID[spellId];
  return assetId ? `${DDRAGON_BASE}/cdn/${version}/img/spell/${assetId}.png` : "";
}
