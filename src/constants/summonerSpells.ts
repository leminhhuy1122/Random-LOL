import type { Language } from "@/i18n/dictionaries";
import type { LaneId } from "@/types/random";

export type SpellRule = {
  id: string;
  name: Record<Language, string>;
};

export const SPELLS: Record<string, SpellRule> = {
  flash: { id: "SummonerFlash", name: { en: "Flash", vi: "Tốc Biến" } },
  smite: { id: "SummonerSmite", name: { en: "Smite", vi: "Trừng Phạt" } },
  teleport: { id: "SummonerTeleport", name: { en: "Teleport", vi: "Dịch Chuyển" } },
  ignite: { id: "SummonerDot", name: { en: "Ignite", vi: "Thiêu Đốt" } },
  heal: { id: "SummonerHeal", name: { en: "Heal", vi: "Hồi Máu" } },
  exhaust: { id: "SummonerExhaust", name: { en: "Exhaust", vi: "Kiệt Sức" } },
  barrier: { id: "SummonerBarrier", name: { en: "Barrier", vi: "Lá Chắn" } },
  cleanse: { id: "SummonerBoost", name: { en: "Cleanse", vi: "Thanh Tẩy" } },
  ghost: { id: "SummonerHaste", name: { en: "Ghost", vi: "Tốc Hành" } },
};

export const LANE_SPELL_POOL: Record<LaneId, SpellRule[]> = {
  top: [SPELLS.teleport, SPELLS.ignite, SPELLS.ghost],
  jungle: [SPELLS.smite],
  mid: [SPELLS.ignite, SPELLS.teleport, SPELLS.barrier, SPELLS.cleanse],
  ad: [SPELLS.heal, SPELLS.cleanse, SPELLS.barrier, SPELLS.ghost],
  sp: [SPELLS.ignite, SPELLS.exhaust, SPELLS.heal],
};
