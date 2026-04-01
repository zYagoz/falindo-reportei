import { NextRequest, NextResponse } from "next/server";
import { fetchDemographics } from "@/lib/api/meta/instagram";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const accountId = searchParams.get("accountId");
  const timeframe = searchParams.get("timeframe") ?? "this_month";

  if (!accountId) {
    return NextResponse.json({ error: "Parâmetro obrigatório: accountId" }, { status: 400 });
  }

  if (timeframe !== "this_month" && timeframe !== "this_week") {
    return NextResponse.json(
      { error: "timeframe deve ser this_month ou this_week" },
      { status: 400 },
    );
  }

  try {
    const demographics = await fetchDemographics(accountId, timeframe);
    return NextResponse.json({ demographics });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
