import { NextResponse } from "next/server";
import { fetchFacebookPages } from "@/lib/api/meta/facebook";

export async function GET() {
  try {
    const pages = await fetchFacebookPages();
    return NextResponse.json({ pages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
