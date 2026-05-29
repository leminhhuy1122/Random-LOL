import { ACCOUNT_ROUTE_BY_REGION, MATCH_ROUTE_BY_REGION } from "@/constants/regions";
import {
  getChampionIdentityMap,
  getItemIconUrl,
  getSummonerSpellIconUrl
} from "@/services/riotDataDragon.service";
import type {
  PlatformRegion,
  PlayerChampionStat,
  PlayerLookupResult,
  PlayerMatchItem,
  RankInfo
} from "@/types/player";

type RiotAccount = {
  puuid: string;
  gameName: string;
  tagLine: string;
};

type RiotSummoner = {
  summonerLevel: number;
  profileIconId: number;
};

type RiotLeagueEntry = RankInfo & {
  queueType: RankInfo["queueType"];
};

type RiotChampionMastery = {
  championId: number;
  championLevel: number;
  championPoints: number;
};

type RiotMatch = {
  metadata: {
    matchId: string;
  };
  info: {
    gameDuration: number;
    gameEndTimestamp: number;
    queueId: number;
    participants: RiotParticipant[];
  };
};

type RiotParticipant = {
  puuid: string;
  championId: number;
  championName: string;
  champLevel: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  totalDamageDealtToChampions: number;
  damageDealtToObjectives: number;
  damageDealtToTurrets: number;
  goldEarned: number;
  visionScore: number;
  summoner1Id: number;
  summoner2Id: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  teamId: number;
};

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";
const RECENT_MATCH_COUNT = 20;
const MATCH_FETCH_BATCH_SIZE = 5;
const INVISIBLE_RIOT_ID_CHARS = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

async function riotFetch<T>(url: string, apiKey: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": apiKey
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const error = new Error(`Riot API error: ${response.status}`);
    error.name = String(response.status);
    throw error;
  }

  return response.json() as Promise<T>;
}

export function normalizeRiotId(value: string) {
  return value
    .replace(INVISIBLE_RIOT_ID_CHARS, "")
    .replace("＃", "#")
    .replace(/\s*#\s*/g, "#")
    .trim();
}

export function parseRiotId(value: string) {
  const [gameName, tagLine] = normalizeRiotId(value).split("#").map((part) => part.trim());

  if (!gameName || !tagLine) {
    throw new Error("Riot ID phải có dạng Tên#Tagline");
  }

  return { gameName, tagLine };
}

export async function lookupPlayer(params: {
  riotId: string;
  region: PlatformRegion;
  apiKey: string;
  dataDragonVersion: string;
}): Promise<PlayerLookupResult> {
  const { gameName, tagLine } = parseRiotId(params.riotId);
  const platform = params.region.toLowerCase();
  const accountRoute = ACCOUNT_ROUTE_BY_REGION[params.region];
  const matchRoute = MATCH_ROUTE_BY_REGION[params.region];
  const championMapPromise = getChampionIdentityMap(params.dataDragonVersion);

  const account = await riotFetch<RiotAccount>(
    `https://${accountRoute}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`,
    params.apiKey
  );
  const [championMap, summoner, entries, masteries, matchIds] = await Promise.all([
    championMapPromise,
    riotFetch<RiotSummoner>(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
      params.apiKey
    ),
    riotFetch<RiotLeagueEntry[]>(
      `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${account.puuid}`,
      params.apiKey
    ),
    riotFetch<RiotChampionMastery[]>(
      `https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}`,
      params.apiKey
    ).catch(() => []),
    riotFetch<string[]>(
      `https://${matchRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${account.puuid}/ids?start=0&count=${RECENT_MATCH_COUNT}`,
      params.apiKey
    ).catch(() => [])
  ]);

  const topMastery = [...masteries].sort((a, b) => b.championPoints - a.championPoints)[0];
  const championIdentity = topMastery ? championMap.get(topMastery.championId) : undefined;
  const matches = await fetchRecentMatches(matchRoute, matchIds, params.apiKey);
  const matchItems = buildMatchItems(matches, account.puuid, params.dataDragonVersion, championMap);
  const performance = buildPerformanceSummary(matchItems);
  const championStats = buildChampionStats(matchItems);
  const analysis = buildPerformanceAnalysis(matches, account.puuid);

  return {
    riotId: `${account.gameName}#${account.tagLine}`,
    region: params.region,
    profileIconUrl: `${DDRAGON_BASE}/cdn/${params.dataDragonVersion}/img/profileicon/${summoner.profileIconId}.png`,
    level: summoner.summonerLevel,
    soloRank: entries.find((entry) => entry.queueType === "RANKED_SOLO_5x5"),
    flexRank: entries.find((entry) => entry.queueType === "RANKED_FLEX_SR"),
    topChampion: topMastery && championIdentity
      ? {
          id: topMastery.championId,
          key: championIdentity.key,
          name: championIdentity.name,
          splashUrl: championIdentity.splashUrl,
          masteryLevel: topMastery.championLevel,
          championPoints: topMastery.championPoints
        }
      : undefined,
    matches: matchItems,
    championStats: championStats.all,
    mostPlayedChampions: championStats.mostPlayed,
    bestWinrateChampions: championStats.bestWinrate,
    performance,
    analysis
  };
}

async function fetchRecentMatches(route: string, matchIds: string[], apiKey: string) {
  const matches: RiotMatch[] = [];

  for (let index = 0; index < matchIds.length; index += MATCH_FETCH_BATCH_SIZE) {
    const batch = matchIds.slice(index, index + MATCH_FETCH_BATCH_SIZE);
    const results = await Promise.all(
      batch.map((matchId) =>
        riotFetch<RiotMatch>(`https://${route}.api.riotgames.com/lol/match/v5/matches/${matchId}`, apiKey).catch(() => undefined)
      )
    );
    matches.push(...results.filter(Boolean) as RiotMatch[]);
  }

  return matches;
}

function buildMatchItems(
  matches: RiotMatch[],
  puuid: string,
  version: string,
  championMap: Awaited<ReturnType<typeof getChampionIdentityMap>>
): PlayerMatchItem[] {
  return matches
    .map((match) => {
      const participant = match.info.participants.find((item) => item.puuid === puuid);
      if (!participant) return undefined;

      const durationMinutes = Math.max(match.info.gameDuration / 60, 1);
      const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
      const teamKills = match.info.participants
        .filter((item) => item.teamId === participant.teamId)
        .reduce((total, item) => total + item.kills, 0);
      const identity = championMap.get(participant.championId);
      const participantScore = getParticipantScore(participant);
      const teamBestScore = Math.max(
        ...match.info.participants
          .filter((item) => item.teamId === participant.teamId)
          .map((item) => getParticipantScore(item))
      );

      return {
        id: match.metadata.matchId,
        championKey: identity?.key ?? participant.championName,
        championName: identity?.name ?? participant.championName,
        championIconUrl: identity?.iconUrl ?? `${DDRAGON_BASE}/cdn/${version}/img/champion/${participant.championName}.png`,
        level: participant.champLevel,
        win: participant.win,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        kda: round((participant.kills + participant.assists) / Math.max(participant.deaths, 1), 2),
        cs,
        csPerMinute: round(cs / durationMinutes, 1),
        damagePerMinute: Math.round(participant.totalDamageDealtToChampions / durationMinutes),
        killParticipation: teamKills > 0 ? Math.round(((participant.kills + participant.assists) / teamKills) * 100) : 0,
        goldEarned: participant.goldEarned,
        queueName: getQueueName(match.info.queueId),
        queueId: match.info.queueId,
        queueGroup: getQueueGroup(match.info.queueId),
        gameEndedAt: match.info.gameEndTimestamp,
        durationSeconds: match.info.gameDuration,
        items: [
          participant.item0,
          participant.item1,
          participant.item2,
          participant.item3,
          participant.item4,
          participant.item5,
          participant.item6
        ].map((itemId) => getItemIconUrl(version, itemId)).filter(Boolean),
        summonerSpells: [
          getSummonerSpellIconUrl(version, participant.summoner1Id),
          getSummonerSpellIconUrl(version, participant.summoner2Id)
        ].filter(Boolean),
        isMvp: participant.win && participantScore === teamBestScore,
        isAce: !participant.win && participantScore === teamBestScore
      };
    })
    .filter(Boolean) as PlayerMatchItem[];
}

function buildPerformanceSummary(matches: PlayerMatchItem[]) {
  const games = matches.length;
  const wins = matches.filter((match) => match.win).length;
  const kills = sum(matches, "kills");
  const deaths = sum(matches, "deaths");
  const assists = sum(matches, "assists");

  return {
    games,
    wins,
    losses: games - wins,
    winrate: games > 0 ? Math.round((wins / games) * 100) : 0,
    kda: round((kills + assists) / Math.max(deaths, 1), 2),
    kills,
    deaths,
    assists,
    csPerMinute: games > 0 ? round(matches.reduce((total, match) => total + match.csPerMinute, 0) / games, 1) : 0,
    damagePerMinute: games > 0 ? Math.round(matches.reduce((total, match) => total + match.damagePerMinute, 0) / games) : 0,
    killParticipation: games > 0 ? Math.round(matches.reduce((total, match) => total + match.killParticipation, 0) / games) : 0,
    mvp: matches.filter((match) => match.isMvp).length,
    ace: matches.filter((match) => match.isAce).length
  };
}

function buildChampionStats(matches: PlayerMatchItem[]) {
  const stats = new Map<string, PlayerChampionStat>();

  matches.forEach((match) => {
    const current = stats.get(match.championKey) ?? {
      championKey: match.championKey,
      championName: match.championName,
      championIconUrl: match.championIconUrl,
      games: 0,
      wins: 0,
      winrate: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      kda: 0
    };

    current.games += 1;
    current.wins += match.win ? 1 : 0;
    current.kills += match.kills;
    current.deaths += match.deaths;
    current.assists += match.assists;
    current.winrate = Math.round((current.wins / current.games) * 100);
    current.kda = round((current.kills + current.assists) / Math.max(current.deaths, 1), 2);
    stats.set(match.championKey, current);
  });

  const values = [...stats.values()].sort((a, b) => b.games - a.games || b.winrate - a.winrate);
  const meaningfulWinrate = values.filter((champion) => champion.games >= 3);

  return {
    all: values,
    mostPlayed: [...values].sort((a, b) => b.games - a.games || b.winrate - a.winrate).slice(0, 5),
    bestWinrate: [...meaningfulWinrate].sort((a, b) => b.winrate - a.winrate || b.games - a.games).slice(0, 5)
  };
}

function buildPerformanceAnalysis(matches: RiotMatch[], puuid: string) {
  const participants = matches
    .map((match) => match.info.participants.find((participant) => participant.puuid === puuid))
    .filter(Boolean) as RiotParticipant[];

  if (participants.length === 0) {
    return { combat: 0, attack: 0, vision: 0, objective: 0, farm: 0 };
  }

  const durationMinutes = matches.map((match) => Math.max(match.info.gameDuration / 60, 1));
  const average = (values: number[]) => values.reduce((total, value) => total + value, 0) / values.length;

  return {
    combat: clampScore(average(participants.map((item) => item.kills * 10 + item.assists * 5 - item.deaths * 4))),
    attack: clampScore(average(participants.map((item, index) => item.totalDamageDealtToChampions / durationMinutes[index] / 10))),
    vision: clampScore(average(participants.map((item) => item.visionScore * 4))),
    objective: clampScore(average(participants.map((item) => (item.damageDealtToObjectives + item.damageDealtToTurrets) / 450))),
    farm: clampScore(average(participants.map((item, index) => ((item.totalMinionsKilled + item.neutralMinionsKilled) / durationMinutes[index]) * 12)))
  };
}

function getParticipantScore(participant: RiotParticipant) {
  return round(
    participant.kills * 2 +
      participant.assists * 1.45 +
      participant.totalDamageDealtToChampions / 1000 +
      participant.goldEarned / 1400 +
      participant.visionScore * 0.25 -
      participant.deaths * 1.8,
    2
  );
}

function getQueueName(queueId: number) {
  const names: Record<number, string> = {
    400: "Thường",
    420: "Đơn/Đôi",
    430: "Thường",
    440: "Linh hoạt 5v5",
    450: "ARAM",
    700: "Clash",
    1700: "Arena"
  };

  return names[queueId] ?? "Thường";
}

function getQueueGroup(queueId: number): PlayerMatchItem["queueGroup"] {
  if (queueId === 420) return "solo";
  if (queueId === 440) return "flex";
  if (queueId === 450) return "aram";
  if (queueId === 400 || queueId === 430) return "normal";
  return "other";
}

function sum(matches: PlayerMatchItem[], field: "kills" | "deaths" | "assists") {
  return matches.reduce((total, match) => total + match[field], 0);
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
