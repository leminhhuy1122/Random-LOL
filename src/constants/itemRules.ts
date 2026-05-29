import type { Language } from "@/i18n/dictionaries";
import type { ChampionTag } from "@/types/champion";

export type ItemRule = {
  id: string;
  name: Record<Language, string>;
};

export const ITEM_RULES: Record<ChampionTag, ItemRule[]> = {
  Mage: [
    { id: "6655", name: { en: "Luden's Companion", vi: "Vọng Âm Luden" } },
    { id: "4646", name: { en: "Stormsurge", vi: "Bão Tố Luden" } },
    { id: "3089", name: { en: "Rabadon's Deathcap", vi: "Mũ Phù Thủy Rabadon" } },
  ],
  Marksman: [
    { id: "3031", name: { en: "Infinity Edge", vi: "Vô Cực Kiếm" } },
    { id: "3085", name: { en: "Runaan's Hurricane", vi: "Cuồng Cung Runaan" } },
    { id: "3094", name: { en: "Rapid Firecannon", vi: "Đại Bác Liên Thanh" } },
  ],
  Tank: [
    { id: "3068", name: { en: "Sunfire Aegis", vi: "Áo Choàng Lửa" } },
    { id: "6665", name: { en: "Jak'Sho, The Protean", vi: "Jak'Sho Vỏ Bọc Thích Nghi" } },
    { id: "3075", name: { en: "Thornmail", vi: "Giáp Gai" } },
  ],
  Assassin: [
    { id: "6692", name: { en: "Eclipse", vi: "Nguyệt Đao" } },
    { id: "3142", name: { en: "Youmuu's Ghostblade", vi: "Kiếm Ma Youmuu" } },
    { id: "3814", name: { en: "Edge of Night", vi: "Áo Choàng Bóng Tối" } },
  ],
  Fighter: [
    { id: "3078", name: { en: "Trinity Force", vi: "Tam Hợp Kiếm" } },
    { id: "6631", name: { en: "Stridebreaker", vi: "Chùy Phản Kích" } },
    { id: "6333", name: { en: "Death's Dance", vi: "Vũ Điệu Tử Thần" } },
  ],
  Support: [
    { id: "2065", name: { en: "Shurelya's Battlesong", vi: "Vương Miện Shurelya" } },
    { id: "6617", name: { en: "Moonstone Renewer", vi: "Bùa Nguyệt Thạch" } },
    { id: "3109", name: { en: "Knight's Vow", vi: "Lời Thề Hiệp Sĩ" } },
  ],
};

export const BOOT_RULES: Record<ChampionTag, ItemRule[]> = {
  Mage: [
    { id: "3020", name: { en: "Sorcerer's Shoes", vi: "Giày Pháp Sư" } },
    { id: "3158", name: { en: "Ionian Boots of Lucidity", vi: "Giày Khai Sáng Ionia" } },
  ],
  Marksman: [{ id: "3006", name: { en: "Berserker's Greaves", vi: "Giày Cuồng Nộ" } }],
  Tank: [
    { id: "3047", name: { en: "Plated Steelcaps", vi: "Giày Thép Gai" } },
    { id: "3111", name: { en: "Mercury's Treads", vi: "Giày Thủy Ngân" } },
  ],
  Assassin: [
    { id: "3158", name: { en: "Ionian Boots of Lucidity", vi: "Giày Khai Sáng Ionia" } },
    { id: "3009", name: { en: "Boots of Swiftness", vi: "Giày Bạc" } },
  ],
  Fighter: [
    { id: "3047", name: { en: "Plated Steelcaps", vi: "Giày Thép Gai" } },
    { id: "3111", name: { en: "Mercury's Treads", vi: "Giày Thủy Ngân" } },
  ],
  Support: [
    { id: "3158", name: { en: "Ionian Boots of Lucidity", vi: "Giày Khai Sáng Ionia" } },
    { id: "3111", name: { en: "Mercury's Treads", vi: "Giày Thủy Ngân" } },
  ],
};
