// lib/vercel.ts - Vercel API integration

import { PARISH_CALENDAR_DEPENDENCIES } from "@/lib/parish-calendar-templates";

export type StaticImage = { path: string; base64: string };

// Returns the user's decrypted OAuth token + teamId, or null if not connected.
export async function getValidVercelToken(
  userId: string
): Promise<{ token: string; teamId: string | null } | null> {
  const { getDecryptedVercelToken } = await import("@/lib/db");
  return getDecryptedVercelToken(userId);
}

export async function deployToVercel(
  projectName: string,
  code: string,
  options?: {
    userToken?: string;
    teamId?: string | null;
    staticImages?: StaticImage[];
    parishCalendarFiles?: Record<string, string>;
  }
): Promise<{ id: string; url: string; projectId: string | null }> {
  // Prefer user's own Vercel token; fall back to app token (used by edit feature)
  const token = options?.userToken ?? process.env.VERCEL_API_TOKEN;
  const teamId = options?.teamId;
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
    // #region agent log
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H4',location:'lib/vercel.ts:86',message:'deployToVercel called',data:{projectName,hasUserToken:!!options?.userToken,usingFallbackToken:!options?.userToken,teamId:teamId??null,staticImagesCount:options?.staticImages?.length??0,parishCalendarFilesCount:options?.parishCalendarFiles?Object.keys(options.parishCalendarFiles).length:0},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H4',location:'lib/vercel.ts:119',message:'vercel deployment API failed',data:{projectName,status:response.status,errorBody:typeof errBody==='string'?errBody.slice(0,600):JSON.stringify(errBody).slice(0,600)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw new Error(
        `Vercel API error: ${response.status} ${JSON.stringify(errBody)}`
      );
    }

    const data = await response.json();

    // Vercel returns the project ID in different fields depending on API version
    const projectId: string | null =
      data.projectId ?? data.project?.id ?? null;
    // #region agent log
    fetch('http://127.0.0.1:7469/ingest/a117af1e-34fc-4785-aeae-36ebe2d13be6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dfd4e1'},body:JSON.stringify({sessionId:'dfd4e1',runId,hypothesisId:'H3',location:'lib/vercel.ts:131',message:'vercel deployment API succeeded',data:{projectName,deploymentId:data.id,deploymentUrl:data.url,projectId:projectId??null,nameFromResponse:data.name??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

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
