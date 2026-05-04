// app/api/generate-site/route.ts - Main endpoint for generating websites

import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteCode } from "@/lib/anthropic";
import {
  createGitHubRepository,
  pushCodeToGitHub,
} from "@/lib/github";
import { deployToVercel } from "@/lib/vercel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, siteName, userId } = body;

    if (!prompt || !siteName || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Starting site generation for:", siteName);

    // Step 1: Generate code with Claude
    console.log("Calling Claude API...");
    const websiteCode = await generateWebsiteCode(prompt);
    console.log("✅ Code generated");

    // Step 2: Create GitHub repository
    const repoName = `website-${userId}-${Date.now()}`;
    console.log("Creating GitHub repo:", repoName);
    const repo = await createGitHubRepository(
      repoName,
      `Auto-generated website: ${siteName}`
    );
    console.log("✅ GitHub repo created:", repo.html_url);

    // Step 3: Push code to GitHub
    console.log("Pushing code to GitHub...");
    await pushCodeToGitHub(repo.owner, repo.name, websiteCode);
    console.log("✅ Code pushed to GitHub");

    // Step 4: Deploy to Vercel
    console.log("Deploying to Vercel...");
    const deployment = await deployToVercel(repoName, websiteCode);
    console.log("✅ Deployment started:", deployment.url);

    // Step 5: Return success response
    return NextResponse.json({
      success: true,
      siteUrl: `https://${deployment.url}`,
      githubUrl: repo.html_url,
      repoName: repo.name,
      message: "Your website is ready!",
    });
  } catch (error) {
    console.error("Error generating site:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}