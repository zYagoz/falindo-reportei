import { NextRequest, NextResponse } from "next/server";
import { fetchOverviewAggregate } from "@/lib/api/meta/instagram";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const accountId = searchParams.get("accountId");
  const since = searchParams.get("since");
  const until = searchParams.get("until");

  if (!accountId || !since || !until) {
    return NextResponse.json(
      { error: "Parâmetros obrigatórios: accountId, since, until" },
      { status: 400 },
    );
  }

  try {
    const overview = await fetchOverviewAggregate(accountId, since, until);
    return NextResponse.json({ overview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
