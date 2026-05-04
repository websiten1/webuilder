// lib/github.ts - GitHub API integration

export async function createGitHubRepository(
  repoName: string,
  description: string
): Promise<{ owner: string; name: string; html_url: string }> {
  const token = process.env.GITHUB_BOT_TOKEN;

  if (!token) {
    throw new Error("GITHUB_BOT_TOKEN not set");
  }

  try {
    const response = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        description,
        private: false,
        auto_init: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      owner: data.owner.login,
      name: data.name,
      html_url: data.html_url,
    };
  } catch (error) {
    console.error("Error creating GitHub repository:", error);
    throw error;
  }
}

export async function pushCodeToGitHub(
  owner: string,
  repo: string,
  code: string,
  filePath: string = "pages/index.tsx"
): Promise<void> {
  const token = process.env.GITHUB_BOT_TOKEN;

  if (!token) {
    throw new Error("GITHUB_BOT_TOKEN not set");
  }

  try {
    const branchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );

    const branchData = await branchResponse.json();
    const parentSha = branchData.object.sha;

    const blobResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: code,
          encoding: "utf-8",
        }),
      }
    );

    const blobData = await blobResponse.json();

    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_tree: parentSha,
          tree: [
            {
              path: filePath,
              mode: "100644",
              type: "blob",
              sha: blobData.sha,
            },
          ],
        }),
      }
    );

    const treeData = await treeResponse.json();

    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Initial website code",
          tree: treeData.sha,
          parents: [parentSha],
        }),
      }
    );

    const commitData = await commitResponse.json();

    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`,
      {
        method: "PATCH",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sha: commitData.sha,
        }),
      }
    );
  } catch (error) {
    console.error("Error pushing code to GitHub:", error);
    throw error;
  }
}