import { NextRequest, NextResponse } from "next/server";
import { fetchStories } from "@/lib/api/meta/instagram";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return NextResponse.json({ error: "Parametro obrigatorio: accountId" }, { status: 400 });
  }

  try {
    const stories = await fetchStories(accountId);
    return NextResponse.json({ stories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
