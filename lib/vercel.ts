// lib/vercel.ts - Vercel API integration

export type StaticImage = { path: string; base64: string };

export async function deployToVercel(
  projectName: string,
  code: string,
  options?: { userToken?: string; teamId?: string | null; staticImages?: StaticImage[] }
): Promise<{ id: string; url: string; projectId: string | null }> {
  // Prefer user's own Vercel token; fall back to app token (used by edit feature)
  const token = options?.userToken ?? process.env.VERCEL_API_TOKEN;
  const teamId = options?.teamId;

  if (!token) {
    throw new Error("No Vercel token available. VERCEL_API_TOKEN not set.");
  }

  const packageJson = JSON.stringify(
    {
      name: projectName,
      version: "0.1.0",
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: {
        next: "^14.2.0",
        react: "^18.3.0",
        "react-dom": "^18.3.0",
      },
      devDependencies: {
        typescript: "^5.0.0",
        "@types/react": "^18.3.0",
        "@types/node": "^20.0.0",
        "@types/react-dom": "^18.3.0",
      },
    },
    null,
    2
  );

  const tsConfig = JSON.stringify(
    {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: false,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
      },
      include: ["**/*.ts", "**/*.tsx"],
      exclude: ["node_modules"],
    },
    null,
    2
  );

  try {
    const deployUrl = teamId
      ? `https://api.vercel.com/v13/deployments?teamId=${teamId}`
      : "https://api.vercel.com/v13/deployments";
    const response = await fetch(deployUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        files: [
          { file: "package.json", data: packageJson },
          { file: "tsconfig.json", data: tsConfig },
          { file: "next.config.js", data: `/** @type {import('next').NextConfig} */\nmodule.exports = { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true } };` },
          { file: "pages/index.tsx", data: code },
          // Static image files — deployed to public/ so they're accessible as /logo.png etc.
          ...(options?.staticImages ?? []).map(img => ({
            file: `public/${img.path}`,
            data: img.base64,
            encoding: "base64",
          })),
        ],
        target: "production",
        projectSettings: {
          framework: "nextjs",
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => response.text());
      throw new Error(
        `Vercel API error: ${response.status} ${JSON.stringify(errBody)}`
      );
    }

    const data = await response.json();

    // Vercel returns the project ID in different fields depending on API version
    const projectId: string | null =
      data.projectId ?? data.project?.id ?? null;

    console.log(`Vercel deployment: id=${data.id} projectId=${projectId ?? "unknown"} url=${data.url}`);

    return {
      id: data.id,
      url: data.url,
      projectId,       // actual Vercel project ID (e.g. "prj_abc123")
    };
  } catch (error) {
    console.error("Error deploying to Vercel:", error);
    throw error;
  }
}

export async function checkDeploymentStatus(
  deploymentId: string
): Promise<{ state: string; url?: string }> {
  const token = process.env.VERCEL_API_TOKEN;

  if (!token) {
    throw new Error("VERCEL_API_TOKEN not set");
  }

  try {
    const response = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => response.text());
      throw new Error(
        `Vercel API error: ${response.status} ${JSON.stringify(errBody)}`
      );
    }

    const data = await response.json();

    return {
      state: data.state,
      url: data.url,
    };
  } catch (error) {
    console.error("Error checking deployment status:", error);
    throw error;
  }
}
