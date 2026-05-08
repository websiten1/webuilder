import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const cwd = process.cwd();
  const envPath = path.join(cwd, ".env.local");

  let fileReadResult = "not attempted";
  let fileKeyPrefix = "";
  try {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    fileKeyPrefix = match?.[1]?.trim()?.slice(0, 15) ?? "no match in file";
    fileReadResult = "success";
  } catch (e) {
    fileReadResult = String(e);
  }

  return NextResponse.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    keyPrefix: process.env.ANTHROPIC_API_KEY?.slice(0, 15) ?? "NOT SET",
    hasGithubToken: !!process.env.GITHUB_BOT_TOKEN,
    hasVercelToken: !!process.env.VERCEL_API_TOKEN,
    cwd,
    envPath,
    fileReadResult,
    fileKeyPrefix,
  });
}
