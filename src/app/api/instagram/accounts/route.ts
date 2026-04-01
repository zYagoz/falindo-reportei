import { NextResponse } from "next/server";
import { fetchInstagramAccounts } from "@/lib/api/meta/instagram";

export async function GET() {
  try {
    const accounts = await fetchInstagramAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
