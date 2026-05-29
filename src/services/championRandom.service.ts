import { BOOT_RULES, ITEM_RULES, type ItemRule } from "@/constants/itemRules";
import { LANES } from "@/constants/lanes";
import { LANE_SPELL_POOL, SPELLS, type SpellRule } from "@/constants/summonerSpells";
import type { Language } from "@/i18n/dictionaries";
import type { Champion, ChampionTag } from "@/types/champion";
import type { BuildAsset, ChampionPick, LaneId, TeamResult } from "@/types/random";
import { pickOne, randomId, shuffle } from "@/utils/random";

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";

function spellToAsset(version: string, spell: SpellRule, language: Language): BuildAsset {
  return {
    id: spell.id,
    name: spell.name[language],
    iconUrl: `${DDRAGON_BASE}/cdn/${version}/img/spell/${spell.id}.png`
  };
}

function itemToAsset(version: string, item: ItemRule, language: Language): BuildAsset {
  return {
    id: item.id,
    name: item.name[language],
    iconUrl: `${DDRAGON_BASE}/cdn/${version}/img/item/${item.id}.png`
  };
}

function primaryTag(champion: Champion): ChampionTag {
  return champion.tags[0] ?? "Fighter";
}

function pickBuild(version: string, champion: Champion, lane: LaneId, language: Language) {
  const tag = primaryTag(champion);
  const items = shuffle(ITEM_RULES[tag]).slice(0, 3).map((item) => itemToAsset(version, item, language));
  const boots = itemToAsset(version, pickOne(BOOT_RULES[tag]), language);
  const secondSpell = lane === "jungle" ? SPELLS.smite : pickOne(LANE_SPELL_POOL[lane]);

  const spells = lane === "jungle"
    ? [spellToAsset(version, SPELLS.flash, language), spellToAsset(version, SPELLS.smite, language)]
    : [spellToAsset(version, SPELLS.flash, language), spellToAsset(version, secondSpell, language)];

  return { spells, items, boots };
}

export function createPick(version: string, champion: Champion, lane: LaneId, language: Language): ChampionPick {
  return {
    pickId: randomId("pick"),
    lane,
    champion,
    ...pickBuild(version, champion, lane, language)
  };
}

export function randomOneCard(version: string, champions: Champion[], language: Language): ChampionPick {
  const lane = pickOne(LANES).id;
  return createPick(version, pickOne(champions), lane, language);
}

export function randomTeam(
  version: string,
  champions: Champion[],
  selectedLanes: LaneId[],
  name: string,
  side: TeamResult["side"],
  language: Language,
  excludedChampionIds: Set<string> = new Set()
): TeamResult {
  const available = shuffle(champions.filter((champion) => !excludedChampionIds.has(champion.id)));
  const picks = selectedLanes.map((lane, index) => createPick(version, available[index], lane, language));

  return {
    id: randomId("team"),
    name,
    side,
    picks
  };
}
