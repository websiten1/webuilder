// lib/vercel.ts - Vercel API integration

import { PARISH_CALENDAR_DEPENDENCIES } from "@/lib/parish-calendar-templates";

export type StaticImage = { path: string; base64: string };

export const VERCEL_RECONNECT_MESSAGE =
  "Your Vercel account is not connected or has expired. Please reconnect your Vercel account and retry.";

export class VercelAuthError extends Error {
  constructor(message = VERCEL_RECONNECT_MESSAGE) {
    super(message);
    this.name = "VercelAuthError";
  }
}

// Returns the user's decrypted OAuth token + teamId, or null if not connected.
export async function getValidVercelToken(
  userId: string
): Promise<{ token: string; teamId: string | null } | null> {
  const { getDecryptedVercelToken } = await import("@/lib/db");
  return getDecryptedVercelToken(userId);
}

export async function requireUserVercelAuth(
  userId: string
): Promise<{ token: string; teamId?: string }> {
  const auth = await getValidVercelToken(userId);
  if (!auth) {
    throw new VercelAuthError();
  }
  return { token: auth.token, teamId: auth.teamId ?? undefined };
}

export async function resolveVercelApiAuth(
  userId: string
): Promise<{ token: string; teamId?: string }> {
  return requireUserVercelAuth(userId);
}

export function vercelTeamQuery(teamId?: string | null): string {
  return teamId ? `?teamId=${teamId}` : "";
}

export function normalizeDeploymentUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export function resolveVercelDeployName(site: {
  vercel_project_name?: string | null;
  vercel_project_id?: string | null;
  vercel_url?: string | null;
}): string {
  if (site.vercel_project_name) return site.vercel_project_name;
  const projectId = site.vercel_project_id;
  if (projectId && !projectId.startsWith("prj_")) return projectId;
  if (site.vercel_url) {
    try {
      const host = new URL(
        site.vercel_url.startsWith("http") ? site.vercel_url : `https://${site.vercel_url}`
      ).hostname;
      if (host.endsWith(".vercel.app")) {
        return host.slice(0, -".vercel.app".length);
      }
    } catch {
      /* fall through */
    }
  }
  throw new Error("Cannot resolve Vercel project deploy name for site");
}

export async function deleteVercelProject(
  projectIdOrName: string,
  token: string,
  teamId?: string | null
): Promise<void> {
  const teamQuery = vercelTeamQuery(teamId);
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${encodeURIComponent(projectIdOrName)}${teamQuery}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok && res.status !== 404) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to delete Vercel project (${res.status}): ${body.slice(0, 200)}`);
  }
}

export async function deployToVercel(
  projectName: string,
  code: string,
  options?: {
    userToken?: string;
    teamId?: string | null;
    requireUserToken?: boolean;
    staticImages?: StaticImage[];
    parishCalendarFiles?: Record<string, string>;
  }
): Promise<{ id: string; url: string; projectId: string | null }> {
  if (options?.requireUserToken && !options?.userToken) {
    throw new VercelAuthError();
  }
  const token = options?.requireUserToken
    ? options.userToken!
    : (options?.userToken ?? process.env.VERCEL_API_TOKEN);
  const teamId = options?.teamId;

  if (!token) {
    throw new Error("No Vercel token available. VERCEL_API_TOKEN not set.");
  }

  const extraDeps = options?.parishCalendarFiles ? PARISH_CALENDAR_DEPENDENCIES : {};

  const packageJson = JSON.stringify(
    {
      name: projectName,
      version: "0.1.0",
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: {
        next: "^14.2.0",
        react: "^18.3.0",
        "react-dom": "^18.3.0",
        ...extraDeps,
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
          ...Object.entries(options?.parishCalendarFiles ?? {}).map(([file, data]) => ({ file, data })),
        ],
        target: "production",
        projectSettings: {
          framework: "nextjs",
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => response.text());
      if (options?.requireUserToken && (response.status === 401 || response.status === 403)) {
        throw new VercelAuthError();
      }
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

export async function setProjectEnvVars(
  projectId: string,
  token: string,
  teamId: string | null | undefined,
  vars: { key: string; value: string }[]
): Promise<void> {
  const url = teamId
    ? `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`
    : `https://api.vercel.com/v10/projects/${projectId}/env?upsert=true`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      vars.map(v => ({
        key: v.key,
        value: v.value,
        type: "encrypted",
        target: ["production", "preview", "development"],
      }))
    ),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to set Vercel project env vars (${response.status}): ${text}`);
  }
}

// Creates a Blob store and connects it to the project so PARISH_CALENDAR_FILES
// (which read/write via @vercel/blob) work without the user doing manual setup.
// Throws if the token lacks storage scope (e.g. some Vercel Integration OAuth
// tokens) — callers should catch this and fall back to the manual-connect flow.
export async function createAndConnectBlobStore(
  projectId: string,
  token: string,
  teamId: string | null | undefined,
  storeName: string
): Promise<void> {
  const teamQuery = teamId ? `?teamId=${teamId}` : "";

  const createRes = await fetch(`https://api.vercel.com/v1/storage/stores/blob${teamQuery}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: storeName }),
  });
  if (!createRes.ok) {
    throw new Error(`Failed to create Blob store (${createRes.status}): ${await createRes.text()}`);
  }
  const { store } = await createRes.json();

  const connectRes = await fetch(`https://api.vercel.com/v1/storage/stores/${store.id}/connections${teamQuery}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, envVarEnvironments: ["production", "preview", "development"] }),
  });
  if (!connectRes.ok) {
    throw new Error(`Failed to connect Blob store (${connectRes.status}): ${await connectRes.text()}`);
  }
}

export async function checkDeploymentStatus(
  deploymentId: string,
  userToken?: string
): Promise<{ state: string; url?: string }> {
  const token = userToken ?? process.env.VERCEL_API_TOKEN;

  if (!token) {
    throw new Error("No Vercel token available for checkDeploymentStatus");
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
