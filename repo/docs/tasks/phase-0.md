# Phase 0 task specs: Foundation

## 0.1 Scaffold and Convex init

**Goal:** a Next.js app runs locally and is wired to a Convex project.

**Build:**
- Create the app in the repo root with `create-next-app`: App Router, TypeScript, Tailwind, ESLint, no `src/` folder, import alias `@/*`.
- Install `convex`. Make sure a `convex/` folder exists.
- Add `NEXT_PUBLIC_CONVEX_URL` to `.env.local` once Convex is linked.

**Files:** repo root config, `app/`, `convex/`

**Allowed new dependencies:** `convex` only

**Manual step for the user:** run `npx convex dev` once and sign in to link the project. Codex must not try to log in or create accounts.

**Acceptance:**
- `npm run dev` serves the default page at localhost:3000.
- `.env.local` is gitignored.
- `npx tsc --noEmit` passes.

**Out of scope:** Convex Auth, any UI, any schema.

---

## 0.2 Structure and tooling

**Goal:** folders, scripts and formatting are in place so later tasks have a home.

**Build:**
- Folders: `components/ui`, `components/landing`, `lib`.
- `lib/config.ts` exporting `APP_NAME` (placeholder value "UGC Marketplace", the real name is not decided).
- Prettier config, and scripts in `package.json`: `lint`, `typecheck` (`tsc --noEmit`), `format`.
- `.env.example` with `NEXT_PUBLIC_CONVEX_URL=` and nothing else.

**Files:** repo root config files, `lib/config.ts`, empty component folders (add a `.gitkeep`)

**Allowed new dependencies:** `prettier`, `prettier-plugin-tailwindcss`, `zod`

**Acceptance:**
- `npm run lint` and `npm run typecheck` pass.
- `npm run format` runs without errors.

**Out of scope:** pages, components, Convex functions.

---

## 0.3 Landing page: header, hero, footer

**Goal:** the top and bottom of the landing page look finished on phone and desktop.

**Build:**
- Header: `APP_NAME` as text logo; links "How it works" (`#how-it-works`), "Creators" (`#creators`); a "Sign in" link with `href="#"` for now.
- Hero: headline "Get a UGC video for your product, from 5,000 taka." One supporting line about brands paying safely and creators getting paid. Two buttons: "I'm a brand" and "I'm a creator" (both `href="#"` for now).
- Footer: `APP_NAME`, a short tagline, copyright line.
- Mobile-first layout, no hamburger menu (links can wrap or hide below a breakpoint except "Sign in").

**Files:** `app/page.tsx`, `app/layout.tsx` (metadata only), `components/landing/Header.tsx`, `Hero.tsx`, `Footer.tsx`

**Acceptance:**
- No horizontal scroll at 360px width.
- Buttons are at least 44px tall.
- tsc and lint pass.

**Out of scope:** the middle sections, animations, images, auth links.

---

## 0.4 Landing page: sections

**Goal:** the landing page explains the product and shows what the creator directory will look like.

**Build:**
- "How it works" section (`id="how-it-works"`) with 4 steps: brand writes a brief; brand picks a creator; brand pays and the platform holds the money; brand approves the video and the creator is paid.
- "Creators" section (`id="creators"`) with 6 placeholder creator cards from `lib/placeholder-creators.ts`: name, category (beauty, food, fashion, gadgets, baby), price in taka, and an initial-letter avatar. No images or videos.
- Bottom call-to-action band repeating the two buttons.
- Card grid: 1 column on mobile, 2 on tablet, 3 on desktop.

**Files:** `components/landing/HowItWorks.tsx`, `CreatorCards.tsx`, `CtaBand.tsx`, `lib/placeholder-creators.ts`, `app/page.tsx`

**Acceptance:**
- Nav anchors scroll to the right sections.
- No horizontal scroll at 360px.
- tsc and lint pass.

**Out of scope:** real data from Convex, filters, video, links to profile pages.

---

## 0.5 Netlify and Convex deploy config

**Goal:** the app can be deployed, and the user knows exactly which manual steps remain.

**Build:**
- `netlify.toml` using the build command `npx convex deploy --cmd 'npm run build'`.
- A short "Deploy steps" list in the reply covering: connecting the repo in Netlify, setting `CONVEX_DEPLOY_KEY` in Netlify, and how to get the key from the Convex dashboard.

**Files:** `netlify.toml`

**Allowed new dependencies:** none

**Acceptance:**
- `netlify.toml` is valid and contains only what is needed.
- Steps are listed in the reply, not committed as a file.

**Out of scope:** real keys, custom domain, any code changes.
