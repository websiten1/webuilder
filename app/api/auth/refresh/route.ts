import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/session";

export async function POST() {
  await refreshSession();
  return NextResponse.json({ ok: true });
}
