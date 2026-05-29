import { getChampionData } from "@/services/riotDataDragon.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const locale = new URL(request.url).searchParams.get("locale");
    const data = await getChampionData(locale);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json(
      { message: "Could not load champion data from Riot Data Dragon." },
      { status: 502 },
    );
  }
}
