import { NextRequest, NextResponse } from "next/server";
import { fetchFacebookOverviewDebug } from "@/lib/api/meta/facebook";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pageId = searchParams.get("pageId");
  const since = searchParams.get("since");
  const until = searchParams.get("until");

  if (!pageId || !since || !until) {
    return NextResponse.json(
      { error: "Parametros obrigatorios: pageId, since, until" },
      { status: 400 },
    );
  }

  try {
    const debug = await fetchFacebookOverviewDebug(pageId, since, until);
    return NextResponse.json({ debug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
