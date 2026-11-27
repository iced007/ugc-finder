# Known issues

Places where finished work (ticked in [STATUS.md](STATUS.md)) and the old docs in `docs/` disagree, checked against the code on 2026-11-26.

Each issue says what the old docs said, what the code does, and what to do. **Docs fixed** means v2 already describes the code correctly and nothing else is needed. **Needs a task** means code must change, and a spec must be written before anyone starts.

Agents: if your task touches a file named here, read that issue first. Do not fix an issue that your task doesn't name.

## Open

### K.7 Next.js dev validation worker is turned off for a Convex Auth error (B.8)

- **Old docs:** nothing about `next.config.ts`.
- **Code:** `next.config.ts` sets `experimental.devValidationWorker: false`. With the worker on, `next dev` (Next.js 16.4.6, `@convex-dev/auth` 2.1.0) logged "Could not validate `instant`" on /, /signin and /signup: it could not load Convex Auth's dynamically imported client provider. The production build passed. Upstream: https://github.com/vercel/next.js/issues/98393 (open, fix in PR 98401).
- **Do:** Once a released Next.js version includes the fix, upgrade, remove the setting and recheck those routes and /dashboard.

### K.10 Branch preview deploys unverified (from 0.5)

- **Old docs:** "Vercel-style preview deploys through Netlify for each branch."
- **Code:** `netlify.toml` sets only the build command. Branch previews are a Netlify site setting, and previews would also need their own Convex deployment or preview key.
- **Do:** Check in the Netlify dashboard. Until then, v2 does not promise previews.

### K.12 Task 1.6 not browser-checked

- **Code:** dashboards, shell and cards are built; typecheck and lint pass.
- **Do:** Open `/creator` and `/brand` at 360px, save a profile, check "Profile ready" appears, then tick 1.6.

### K.13 No `.git` inside `repo/`

- **Old docs:** bug specs refer to commit `7ea7d27`.
- **Code:** `repo/` has no `.git` directory. The repository may live in the parent folder (`UGC Content_Finder/`), which was not checked.
- **Do:** Run `git status` from `repo/`. If it says "not a git repository", run `git init` and commit before the next task, so every task can be undone.

### K.15 Root `AGENTS.md` still points to the old docs

- **Code:** the root `AGENTS.md` (the file agents load) still says Next.js 14+ and points to `docs/*.md`. The fixed version is `docs/v2/AGENTS.md`; agent tooling blocked writing the root file directly.
- **Do:** Copy `docs/v2/AGENTS.md` over the root `AGENTS.md` before the next agent session, then delete `docs/v2/AGENTS.md` so there is only one copy.

### K.17 Resolved in B.12: public creator page blocking-route error in dev (from 2.6)

- **Code:** `app/creators/[profileId]/page.tsx` sets `export const instant = false`, so the page may block on its per-request query. Before this, dev reported uncached data at the `await connection()` in `getCreator`. `getPublic` results are not cached.
- **Do:** Nothing.

### K.18 Landing header does not work well on other pages (from 2.6)

- **Code:** `components/landing/Header.tsx` is reused by `app/creators/[profileId]/page.tsx`. Its "How it works" and "Creators" links point to `#how-it-works` and `#creators`, and the app name links to `#`, so none of them leads back to the landing page's content. Its links are 20px to 28px high at 360px, under the 44px minimum.
- **Do:** Needs a task: point the links at the landing page and make each tap target at least 44px.

## Docs fixed in v2

| ID | From task | Old docs said | Code does | Fixed in |
| --- | --- | --- | --- | --- |
| K.1 | 0.1, 1.1b | Next.js 14+, middleware | Next 16.4.6, React 19, Tailwind 4, Zod 4, `proxy.ts` | docs/v2/AGENTS.md, tech-stack §1 |
| K.2 | 1.1a | `users` has name, email, avatar | `users` has only `role` (Username + Password gives no email) | tech-stack §5 |
| K.3 | 1.4 | `creatorProfiles` has no `displayName`, has `sampleVideos` | Has `displayName`; samples become their own table in Phase 2 | tech-stack §5 |
| K.5 | 1.4, 1.5, B.3 | `getMine` starts with `requireRole` | `getMine` returns null for a signed-out or wrong-role caller; mutations still use `requireRole` | tech-stack §3, docs/v2/AGENTS.md |
| K.6 | all | `npx tsc --noEmit` in some places, `npm run typecheck` in others | Both run `tsc --noEmit` | `npm run typecheck` everywhere in v2 |
| K.8 | 1.2 | Role "chosen at signup" | Chosen on `/onboarding` after the first sign-in | STATUS.md, tech-stack §3 |
| K.11 | 1.4, 1.5 | Fixed sets as fields | `categories`, `platform`, `category` stored as `v.string()` and checked in handlers | tech-stack §5 (new tables use `v.union`) |
| K.14 | 0.x | Convex Auth set up in Phase 0 | Set up in Phase 1 | roadmap |

## Changes v2 makes to the plan (not code issues)

These were contradictions inside the old docs. v2 settles them; change them back if you disagree.

- **Video access table** now covers every status and order type, including `draft_approved`, `posted` and `live_period` (tech-stack §6).
- **`posted` and `live_period`** are defined: `posted` means the creator has submitted proof; the brand's confirmation moves the order to `live_period` and releases the upfront share (tech-stack §7).
- **Fee and split rounding** is written down as integer formulas (tech-stack §7).
- **Creator accept/decline moved from Phase 3 to Phase 4** (confirmed), because the state machine has the creator accept after payment and checkout is Phase 4.
- **Creator approval moved to Phase 2 (2.5)** (confirmed) and removed from Phase 6. **State machine tests** live only in Phase 4.
- **Low-resolution public samples moved to Phase 7,** since there is no transcoding before then.
- **Payment stages renamed** from "Phase 1/2" to "Stage A/B" so they don't clash with roadmap phases.
- **Public queries** get an explicit rule: no role check only when the doc comment starts with `Public:` and only public fields are returned (tech-stack §3).
- **Phase 2 sample access** doesn't depend on order status, since orders don't exist until Phase 3.
