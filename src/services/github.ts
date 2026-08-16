// GitHub REST & Git Data API Service for Gear Studio

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  description: string | null;
  updated_at: string;
}

export interface LinkedRepoInfo {
  repoName: string;
  fullName: string;
  owner: string;
  branch: string;
  htmlUrl: string;
  isPrivate: boolean;
  lastCommitSha?: string;
  lastCommitMessage?: string;
  lastPushedAt?: string;
}

export interface FileToCommit {
  name: string;
  content: string;
}

// UTF-8 safe base64 encoder for browser & node
export function toBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return btoa(str);
  }
}

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token.trim();
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  // 1. Verify Token and get authenticated user
  async getAuthenticatedUser(): Promise<GitHubUser> {
    const res = await fetch('https://api.github.com/user', {
      headers: this.headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `GitHub authentication failed (${res.status})`);
    }
    return res.json();
  }

  // 2. List user repositories
  async listUserRepos(page = 1, perPage = 50): Promise<GitHubRepo[]> {
    const res = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=${perPage}&page=${page}&type=all`, {
      headers: this.headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch repositories (${res.status})`);
    }
    return res.json();
  }

  // 3. Check if specific repo exists
  async getRepo(owner: string, repo: string): Promise<GitHubRepo | null> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: this.headers,
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to check repository ${owner}/${repo}`);
    }
    return res.json();
  }

  // 4. Create a new repository for the authenticated user
  async createRepo(options: {
    name: string;
    description?: string;
    isPrivate?: boolean;
    autoInit?: boolean;
  }): Promise<GitHubRepo> {
    const res = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        name: options.name,
        description: options.description || 'Generated with Gear Studio AI',
        private: options.isPrivate ?? false,
        auto_init: options.autoInit ?? true,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create repository "${options.name}" (${res.status})`);
    }
    return res.json();
  }

  // 5. Atomic multi-file commit & push (using Git Data API)
  async pushFilesToRepo(params: {
    owner: string;
    repo: string;
    branch?: string;
    message: string;
    files: FileToCommit[];
    onProgress?: (step: string) => void;
  }): Promise<{ commitSha: string; commitUrl: string; htmlUrl: string }> {
    const { owner, repo, message, files, onProgress } = params;
    const branch = params.branch || 'main';

    onProgress?.('Fetching repository branch info...');

    // A. Check if branch reference exists
    let latestCommitSha: string | null = null;
    let baseTreeSha: string | null = null;

    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
      headers: this.headers,
    });

    if (refRes.ok) {
      const refData = await refRes.json();
      latestCommitSha = refData.object.sha;

      // Get base commit to find base tree
      const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, {
        headers: this.headers,
      });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    } else if (refRes.status === 404) {
      // Branch doesn't exist yet; check default branch
      const repoInfo = await this.getRepo(owner, repo);
      const defaultBranch = repoInfo?.default_branch || 'main';
      
      const defaultRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`, {
        headers: this.headers,
      });
      if (defaultRefRes.ok) {
        const defData = await defaultRefRes.json();
        latestCommitSha = defData.object.sha;
        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, {
          headers: this.headers,
        });
        if (commitRes.ok) {
          const commitData = await commitRes.json();
          baseTreeSha = commitData.tree.sha;
        }
      }
    }

    onProgress?.(`Creating Git blobs for ${files.length} files...`);

    // B. Create blobs for each file
    const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];

    for (const file of files) {
      if (!file.name || file.name === '.env.json') continue; // Don't push private workspace metadata
      
      const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          content: toBase64(file.content),
          encoding: 'base64',
        }),
      });

      if (!blobRes.ok) {
        const err = await blobRes.json().catch(() => ({}));
        throw new Error(`Failed to upload ${file.name}: ${err.message || blobRes.statusText}`);
      }

      const blobData = await blobRes.json();
      treeItems.push({
        path: file.name,
        mode: '100644', // normal file
        type: 'blob',
        sha: blobData.sha,
      });
    }

    onProgress?.('Constructing Git tree hierarchy...');

    // C. Create tree
    const treeBody: Record<string, any> = { tree: treeItems };
    if (baseTreeSha) {
      treeBody.base_tree = baseTreeSha;
    }

    const createTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(treeBody),
    });

    if (!createTreeRes.ok) {
      const err = await createTreeRes.json().catch(() => ({}));
      throw new Error(`Failed to create Git tree: ${err.message || createTreeRes.statusText}`);
    }

    const treeData = await createTreeRes.json();
    const newTreeSha = treeData.sha;

    onProgress?.('Generating commit object...');

    // D. Create commit
    const commitBody: Record<string, any> = {
      message: message || 'Update files from Gear Studio',
      tree: newTreeSha,
      parents: latestCommitSha ? [latestCommitSha] : [],
    };

    const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(commitBody),
    });

    if (!newCommitRes.ok) {
      const err = await newCommitRes.json().catch(() => ({}));
      throw new Error(`Failed to create Git commit: ${err.message || newCommitRes.statusText}`);
    }

    const newCommitData = await newCommitRes.json();
    const newCommitSha = newCommitData.sha;

    onProgress?.(`Updating branch ref (heads/${branch})...`);

    // E. Update or create branch ref
    if (latestCommitSha) {
      // Update existing ref
      const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          sha: newCommitSha,
          force: true,
        }),
      });

      if (!updateRefRes.ok) {
        const err = await updateRefRes.json().catch(() => ({}));
        throw new Error(`Failed to update branch "${branch}": ${err.message || updateRefRes.statusText}`);
      }
    } else {
      // Create new ref
      const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha: newCommitSha,
        }),
      });

      if (!createRefRes.ok) {
        const err = await createRefRes.json().catch(() => ({}));
        throw new Error(`Failed to create branch "${branch}": ${err.message || createRefRes.statusText}`);
      }
    }

    onProgress?.('Sync complete!');

    return {
      commitSha: newCommitSha,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`,
      htmlUrl: `https://github.com/${owner}/${repo}`,
    };
  }
}
