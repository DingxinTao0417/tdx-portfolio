/**
 * Global site configuration.
 * Everything personal lives here so it can be edited in one place.
 */
export const site = {
  name: "Dingxin Tao",
  nameZh: "陶鼎新",
  initials: "DT",
  handle: "DingxinTao0417",
  // Public URL of the deployed site (used for canonical URLs, sitemap, OG images).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tdx-portfolio.vercel.app",
  email: "taodingxin0417@gmail.com",
  location: { en: "Los Angeles, CA", zh: "美国 · 洛杉矶" },
  timeZone: "America/Los_Angeles",
  repo: "https://github.com/DingxinTao0417/tdx-portfolio",
  // Optional: drop a PDF into /public and set this to "/resume.pdf" to show the button.
  resumeUrl: undefined as string | undefined,
  socials: [
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com/DingxinTao0417",
      handle: "@DingxinTao0417",
    },
    {
      id: "email",
      label: "Email",
      href: "mailto:taodingxin0417@gmail.com",
      handle: "taodingxin0417@gmail.com",
    },
    // TODO: add your LinkedIn / X handles here once you want them public.
    // { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/…", handle: "in/…" },
  ],
} as const;

export type SocialId = (typeof site.socials)[number]["id"];
