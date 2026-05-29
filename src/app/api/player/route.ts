import { REGIONS } from "@/constants/regions";
import { getLatestDataDragonVersion } from "@/services/riotDataDragon.service";
import { lookupPlayer, parseRiotId } from "@/services/playerLookup.service";
import type { PlatformRegion } from "@/types/player";

export const runtime = "nodejs";

const messages = {
  en: {
    missingKey: "Server chưa cấu hình RIOT_API_KEY trong .env.local.",
    invalidRegion: "Khu vực không hợp lệ.",
    notFound: "Không tìm thấy người chơi.",
    rateLimit: "Riot API đang giới hạn tốc độ.",
    invalidKey: "Riot API key không hợp lệ hoặc đã hết hạn.",
    invalidRiotId: "Riot ID phải có dạng Tên#Tagline.",
    lookupError: "Lỗi tra cứu Riot API.",
  },
  vi: {
    missingKey: "Server chưa cấu hình RIOT_API_KEY trong .env.local.",
    invalidRegion: "Khu vực không hợp lệ.",
    notFound: "Không tìm thấy người chơi.",
    rateLimit: "Riot API đang giới hạn tốc độ.",
    invalidKey: "Riot API key không hợp lệ hoặc đã hết hạn.",
    invalidRiotId: "Riot ID phải có dạng Tên#Tagline.",
    lookupError: "Lỗi tra cứu Riot API.",
  },
};

function getMessages(locale: string | null) {
  return locale === "vi" || locale === "vi_VN" ? messages.vi : messages.en;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const riotId = searchParams.get("riotId") ?? "";
  const region = (searchParams.get("region") ?? "VN2").toUpperCase() as PlatformRegion;
  const copy = getMessages(searchParams.get("locale"));
  const apiKey = process.env.RIOT_API_KEY;

  if (!apiKey) {
    return Response.json({ code: "MISSING_API_KEY", message: copy.missingKey }, { status: 501 });
  }

  if (!REGIONS.includes(region)) {
    return Response.json({ code: "INVALID_REGION", message: copy.invalidRegion }, { status: 400 });
  }

  try {
    parseRiotId(riotId);
  } catch {
    return Response.json({ code: "INVALID_RIOT_ID", message: copy.invalidRiotId }, { status: 400 });
  }

  try {
    const dataDragonVersion = await getLatestDataDragonVersion();
    const player = await lookupPlayer({ riotId, region, apiKey, dataDragonVersion });
    return Response.json(player);
  } catch (error) {
    const statusName = error instanceof Error ? error.name : "";

    if (statusName === "404") {
      return Response.json({ code: "NOT_FOUND", message: copy.notFound }, { status: 404 });
    }

    if (statusName === "429") {
      return Response.json({ code: "RATE_LIMIT", message: copy.rateLimit }, { status: 429 });
    }

    if (statusName === "401" || statusName === "403") {
      return Response.json({ code: "API_KEY_INVALID", message: copy.invalidKey }, { status: 401 });
    }

    return Response.json(
      { code: "LOOKUP_ERROR", message: error instanceof Error ? error.message : copy.lookupError },
      { status: 500 },
    );
  }
}
