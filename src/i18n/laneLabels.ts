import type { LaneId } from "@/types/random";
import type { Language, TranslationKey } from "@/i18n/dictionaries";
import { translate } from "@/i18n/I18nProvider";

const LANE_LABEL_KEYS: Record<LaneId, TranslationKey> = {
  top: "lane.top",
  jungle: "lane.jungle",
  mid: "lane.mid",
  ad: "lane.ad",
  sp: "lane.sp",
};

export function getLaneLabel(language: Language, lane: LaneId) {
  return translate(language, LANE_LABEL_KEYS[lane]);
}
