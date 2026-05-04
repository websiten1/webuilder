import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

const client = new Anthropic({ apiKey });

export async function generateWebsiteCode(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    system:
      "You are an expert web developer. Generate complete, production-ready Next.js page code based on the user's description. Return only the code, no explanations.",
    messages: [
      {
        role: "user",
        content: `Generate a Next.js page component for: ${prompt}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude response");
  }
  return textBlock.text.replace(/^```[a-z]*\n?/i, "").replace(/```$/m, "").trim();
}
