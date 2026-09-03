import { site } from "@/data/site";

export type GitHubProfile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
};

export type GitHubRepo = {
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
  topics: string[];
};

export type GitHubSnapshot = {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  fetchedAt: string;
};

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "User-Agent": "tdx-portfolio",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

/**
 * Fetches the public GitHub profile + recently pushed repos.
 * Cached for an hour through Next's fetch cache; returns null when GitHub
 * is unreachable or rate-limited so callers can render a graceful fallback.
 */
export async function getGitHubSnapshot(): Promise<GitHubSnapshot | null> {
  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${site.handle}`, {
        headers,
        next: { revalidate: 3600, tags: ["github"] },
      }),
      fetch(
        `https://api.github.com/users/${site.handle}/repos?sort=pushed&per_page=6&type=owner`,
        { headers, next: { revalidate: 3600, tags: ["github"] } },
      ),
    ]);
    if (!profileRes.ok || !reposRes.ok) return null;

    type RawProfile = {
      login: string;
      name: string | null;
      avatar_url: string;
      html_url: string;
      bio: string | null;
      public_repos: number;
      followers: number;
      following: number;
      created_at: string;
    };
    type RawRepo = {
      name: string;
      full_name: string;
      html_url: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      pushed_at: string;
      topics?: string[];
      fork: boolean;
    };

    const p = (await profileRes.json()) as RawProfile;
    const repos = (await reposRes.json()) as RawRepo[];

    return {
      profile: {
        login: p.login,
        name: p.name,
        avatarUrl: p.avatar_url,
        htmlUrl: p.html_url,
        bio: p.bio,
        publicRepos: p.public_repos,
        followers: p.followers,
        following: p.following,
        createdAt: p.created_at,
      },
      repos: repos
        .filter((r) => !r.fork)
        .slice(0, 4)
        .map((r) => ({
          name: r.name,
          fullName: r.full_name,
          htmlUrl: r.html_url,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          pushedAt: r.pushed_at,
          topics: r.topics ?? [],
        })),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
