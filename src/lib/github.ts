import { site } from "@/data/site";
import { cache } from "react";
import {
  isGitHubContributionYear,
  parseGitHubContributionCalendar,
  type GitHubContributionCalendar,
} from "@/lib/github-contributions";

export type { GitHubContributionDay, GitHubContributionCalendar } from "@/lib/github-contributions";

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
  external?: boolean;
  visibility?: "private";
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
  topics: string[];
  showcaseKey?: GitHubShowcaseKey;
};

export type GitHubShowcaseKey = "asA" | "multimix" | "portfolio" | "opcWorkspace";

export type GitHubSnapshot = {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  contributions: GitHubContributionCalendar | null;
  fetchedAt: string;
};

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "User-Agent": "tdx-portfolio",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const asAShowcaseRepo: GitHubRepo = {
  name: "As-a",
  fullName: "DingxinTao0417/As-a",
  htmlUrl: "https://github.com/DingxinTao0417/As-a",
  external: true,
  description: null,
  language: "TypeScript",
  stars: 0,
  forks: 0,
  pushedAt: "2026-09-08T09:26:49Z",
  topics: [],
  showcaseKey: "asA",
};

const showcaseKeys: Partial<Record<string, GitHubShowcaseKey>> = {
  "As-a": "asA",
  "MultiMix-Frontend": "multimix",
  "tdx-portfolio": "portfolio",
  "opc-workspace": "opcWorkspace",
};

function addShowcaseKey(repo: GitHubRepo): GitHubRepo {
  const showcaseKey = showcaseKeys[repo.name];
  return showcaseKey ? { ...repo, showcaseKey } : repo;
}

function replaceXiaoshiWithAsA(repos: GitHubRepo[]) {
  const asA = repos.find((repo) => repo.name.toLowerCase() === "as-a") ?? asAShowcaseRepo;
  const otherRepos = repos.filter((repo) => repo.name.toLowerCase() !== "as-a");
  const xiaoshiIndex = otherRepos.findIndex((repo) => repo.name.toLowerCase() === "xiaoshi_ai_notes");
  if (xiaoshiIndex === -1) return [asA, ...otherRepos].slice(0, 4);
  return otherRepos.map((repo, index) => (index === xiaoshiIndex ? asA : repo)).slice(0, 4);
}

export const getGitHubContributionCalendar = cache(async (year?: number): Promise<GitHubContributionCalendar | null> => {
  if (year !== undefined && !isGitHubContributionYear(year)) return null;
  try {
    const url = new URL(`https://github.com/users/${site.handle}/contributions`);
    if (year !== undefined) {
      url.searchParams.set("from", `${year}-01-01`);
      url.searchParams.set("to", `${year}-12-31`);
    }
    const response = await fetch(url, {
      headers: { Accept: "text/html", "Accept-Language": "en-US", "User-Agent": "tdx-portfolio" },
      cache: "force-cache",
      next: { revalidate: 3600, tags: ["github"] },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
    return parseGitHubContributionCalendar(await response.text(), year);
  } catch {
    return null;
  }
});

/**
 * Fetches the public GitHub profile + recently pushed repos.
 * Cached for an hour through Next's fetch cache; returns null when GitHub
 * is unreachable or rate-limited so callers can render a graceful fallback.
 */
export async function getGitHubSnapshot(): Promise<GitHubSnapshot | null> {
  try {
    const [profileRes, reposRes, contributions] = await Promise.all([
      fetch(`https://api.github.com/users/${site.handle}`, {
        headers,
        next: { revalidate: 3600, tags: ["github"] },
      }),
      fetch(
        `https://api.github.com/users/${site.handle}/repos?sort=pushed&per_page=6&type=owner`,
        { headers, next: { revalidate: 3600, tags: ["github"] } },
      ),
      getGitHubContributionCalendar(),
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
      repos: replaceXiaoshiWithAsA(
        repos
          .filter((r) => !r.fork)
          .map((r) =>
            addShowcaseKey({
              name: r.name,
              fullName: r.full_name,
              htmlUrl: r.html_url,
              description: r.description,
              language: r.language,
              stars: r.stargazers_count,
              forks: r.forks_count,
              pushedAt: r.pushed_at,
              topics: r.topics ?? [],
            }),
          ),
      ),
      contributions,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
