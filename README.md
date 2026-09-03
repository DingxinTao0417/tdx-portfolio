# tdx-portfolio

Personal portfolio of **Dingxin Tao (陶鼎新)** — AI Full-Stack Engineer & Forward Deployed Engineer.
B.S. Computer Science @ UC Irvine '26 · M.S. Analytics @ USC '27.

A bilingual (English / 中文), multi-page Next.js 16 site with WebGL scenes, an MDX blog and typed API routes as the backend.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components, Turbopack) |
| UI | React 19 · TypeScript · Tailwind CSS v4 (design tokens in `globals.css`) |
| 3D | Three.js · React Three Fiber · drei (hero "signal core", skill sphere) |
| Motion | [Motion](https://motion.dev) (page transitions, scroll reveals, 3D tilt cards) + Lenis smooth scrolling |
| i18n | next-intl with `[locale]` routing — English at `/`, Chinese at `/zh` |
| Theme | next-themes — light (bone white + signal orange) / dark (midnight ink + ember) |
| Content | MDX posts in `content/blog/{en,zh}` rendered on the server with Shiki (dual-theme highlighting) |
| Backend | Route handlers: `/api/contact` (Zod validation, rate limiting, Resend delivery), `/api/github` (cached GitHub snapshot), `/api/blog` (JSON feed), `/api/og` (dynamic OG images) |
| SEO | `generateMetadata` per page, hreflang alternates, `sitemap.xml`, `robots.txt`, JSON-LD |

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Editing content

Everything personal lives in a few files:

| What | Where |
| --- | --- |
| Name, email, socials, site URL, résumé link | `src/data/site.ts` |
| UI copy for both languages | `src/messages/en.json`, `src/messages/zh.json` |
| Projects / case studies | `src/data/projects.ts` |
| Skills, levels, toolbelt | `src/data/skills.ts` |
| Education & experience timeline | `src/data/timeline.ts` |
| Blog posts | `content/blog/en/*.mdx`, `content/blog/zh/*.mdx` (same slug = translation; English is the fallback) |
| Brand icons | `src/lib/icons.ts` (tree-shaken from `simple-icons`) |

> The project case studies and experience entries shipped in this repo are representative
> placeholders written in the voice of the site. Replace them with your real work — every
> component adapts to the data.

The portrait on the About page is pulled from GitHub (`github.com/<handle>.png`). Drop a photo
into `public/` and point `src/components/about/portrait.tsx` at it to use your own.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and OG images |
| `RESEND_API_KEY` | Enables email delivery for the contact form (otherwise messages are logged only) |
| `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` | Delivery addresses for the contact form |
| `GITHUB_TOKEN` | Optional; raises the GitHub API rate limit for the live commits panel |

## Project structure

```
src/
  app/
    [locale]/            # localized pages: /, /projects, /skills, /blog, /about, /contact
    api/                 # backend route handlers (contact, github, blog, og)
    sitemap.ts robots.ts icon.svg
  components/
    three/               # R3F scenes (hero-scene, tech-sphere)
    home/ projects/ skills/ blog/ about/ contact/ layout/ ui/ providers/
  data/                  # site config + bilingual content data
  i18n/                  # next-intl routing, navigation, request config, URL helpers
  lib/                   # blog loader, MDX pipeline, GitHub client, rate limiter, utils
  messages/              # en.json / zh.json
  proxy.ts               # locale negotiation (Next.js 16 proxy)
content/blog/            # MDX posts per locale
```

## Deploying

Designed for Vercel: import the repository, set the environment variables above, deploy.
Fonts are self-hosted through `next/font`, 3D scenes are code-split and paused when
off-screen, and every page is statically generated for both locales.

## License

MIT © Dingxin Tao
