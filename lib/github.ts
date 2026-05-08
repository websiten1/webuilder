// lib/github.ts - GitHub API integration

const GH_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

async function ghFetch(url: string, init: RequestInit & { token: string }) {
  const { token, ...rest } = init;
  const res = await fetch(url, { ...rest, headers: { ...GH_HEADERS(token), ...(rest.headers ?? {}) } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`GitHub API error ${res.status} at ${url}: ${body.message ?? res.statusText}`);
  }
  return res.json();
}

export async function createGitHubRepository(
  repoName: string,
  description: string
): Promise<{ owner: string; name: string; html_url: string }> {
  const token = process.env.GITHUB_BOT_TOKEN;
  if (!token) throw new Error("GITHUB_BOT_TOKEN not set");

  const data = await ghFetch("https://api.github.com/user/repos", {
    token,
    method: "POST",
    body: JSON.stringify({ name: repoName, description, private: false, auto_init: true }),
  });

  // Wait briefly for the auto-init commit to propagate
  await new Promise((r) => setTimeout(r, 2000));

  return { owner: data.owner.login, name: data.name, html_url: data.html_url };
}

export async function pushCodeToGitHub(
  owner: string,
  repo: string,
  code: string
): Promise<void> {
  const token = process.env.GITHUB_BOT_TOKEN;
  if (!token) throw new Error("GITHUB_BOT_TOKEN not set");

  // 1. Get the HEAD commit SHA on main
  const refData = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`,
    { token }
  );
  const headCommitSha: string = refData.object.sha;

  // 2. Get the tree SHA of that commit (base_tree must be a tree SHA, not a commit SHA)
  const commitData = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits/${headCommitSha}`,
    { token }
  );
  const baseTreeSha: string = commitData.tree.sha;

  // 3. Build the full set of files for a runnable Next.js project
  const packageJson = JSON.stringify(
    {
      name: repo,
      version: "0.1.0",
      private: true,
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: { next: "^14.2.0", react: "^18.3.0", "react-dom": "^18.3.0" },
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

  const tsconfig = JSON.stringify(
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

  const nextConfig = `/** @type {import('next').NextConfig} */
module.exports = { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true } };
`;

  const files = [
    { path: "package.json", content: packageJson },
    { path: "tsconfig.json", content: tsconfig },
    { path: "next.config.js", content: nextConfig },
    { path: "pages/index.tsx", content: code },
  ];

  // 4. Create one blob per file
  const treeItems = await Promise.all(
    files.map(async (f) => {
      const blob = await ghFetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          token,
          method: "POST",
          body: JSON.stringify({ content: f.content, encoding: "utf-8" }),
        }
      );
      return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
    })
  );

  // 5. Create a new tree on top of the base tree
  const treeData = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
    {
      token,
      method: "POST",
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    }
  );

  // 6. Create a commit pointing at the new tree
  const newCommit = await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits`,
    {
      token,
      method: "POST",
      body: JSON.stringify({
        message: "Add AI-generated website",
        tree: treeData.sha,
        parents: [headCommitSha],
      }),
    }
  );

  // 7. Fast-forward the main branch to the new commit
  await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`,
    {
      token,
      method: "PATCH",
      body: JSON.stringify({ sha: newCommit.sha }),
    }
  );
}