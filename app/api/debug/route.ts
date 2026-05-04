import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    keyPrefix: process.env.ANTHROPIC_API_KEY?.slice(0, 15) ?? "NOT SET",
    hasGithubToken: !!process.env.GITHUB_BOT_TOKEN,
    hasVercelToken: !!process.env.VERCEL_API_TOKEN,
  });
}
