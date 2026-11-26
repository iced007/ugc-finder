# UGC Marketplace: agent rules

Bangladesh-first marketplace where brands hire UGC creators to post on their own pages and pay through the platform. All project docs are in `docs/v2/`. Ignore `docs/*.md` outside `v2/`; they are the old version. `docs/tasks/` holds the finished Phase 0, 1 and bug-fix specs as history only.

| File | Read it for |
| --- | --- |
| `docs/v2/STATUS.md` | What is done and what is next |
| `docs/v2/tasks/phase-N.md` | The spec for your task (only that task's section) |
| `docs/v2/tech-stack.md` | Only the numbered sections your spec names |
| `docs/v2/known-issues.md` | Only if your task touches a file listed there |
| `docs/v2/mission.md`, `docs/v2/roadmap.md` | Product context; rarely needed for a task |
| `docs/v2/tasks/task-template.md` | Writing a new spec |

## Start of every session

1. Read this file and `docs/v2/STATUS.md` only.
2. Do the single task the user names. Read its section in `docs/v2/tasks/phase-N.md` and the docs it lists under **Reads**. Do not start the next task.
3. If the task has no spec, or the spec is unclear or conflicts with the docs, stop and ask. Do not guess.

## Fixed stack (do not change)

Next.js 16 (App Router, `proxy.ts` not middleware), React 19, TypeScript strict, Tailwind 4, Convex + Convex Auth v2 (Username + Password), Zod 4, Cloudflare R2 for video, Netlify. Versions and layout: `docs/v2/tech-stack.md` sections 1 and 2. Ask before adding any dependency.

## Token and scope discipline

- Do not scan the repo. Open only the files the task needs; use grep to find symbols.
- Never read `node_modules`, `.next`, `convex/_generated`, lockfiles or build output.
- Edit files in place with small patches. Do not rewrite whole files or paste them back in replies.
- No refactors, renames or "improvements" outside the task, even for issues in `known-issues.md`.
- Checks: `npm run typecheck`, `npm run lint` (on changed files where possible). No test runner exists yet. No full builds unless asked. Keep output short (`| tail -n 30`).
- If a task would touch more than about 8 files or 300 lines, stop and propose a split.
- Final reply: 8 lines max. What changed, files touched, how it was verified, suggested next task.

## App rules

- Roles are `creator`, `brand`, `admin`. Check the role inside every Convex function, not only in the UI:
  - Mutations and actions use `requireUser` or `requireRole` from `convex/lib/roles.ts`.
  - Queries for the caller's own data return `null` for a signed-out or wrong-role caller instead of throwing.
  - A query with no role check must have a doc comment starting `Public:` and return public fields only (approved creators; never user IDs or storage keys).
- Validate every Convex function argument with Convex validators. Use Zod for form input.
- Order status changes only through the single state machine module in `convex/`. Valid transitions are in `docs/v2/tech-stack.md` section 7.
- `post_on_page` is the main order type. Payment is released in two parts: `upfrontPercent` when the brand confirms the post (`posted` to `live_period`), and the rest when the live period ends. A post removed early refunds the remaining held amount. Proof of posting is manual (post link, screenshots, brand confirmation). Do not build scraping or Meta API checks.
- Never store video in Convex. Upload to R2 with presigned URLs; Convex holds metadata only.
- The R2 bucket is always private. Never create a public URL. Create signed URLs only in a Convex action that checks role (and, for order videos, order status). Who gets what: `docs/v2/tech-stack.md` section 6.
- Every limit, timer and money rule lives in `convex/lib/config.ts` (see tech-stack section 4). Never hard-code them. `lib/config.ts` holds only `APP_NAME`.
- Payments are simulated with a ledger table. Write no real payment code and use no real keys.
- Money is stored as integer taka, never floats.
- Secrets go in env vars (R2 keys in Convex env vars) and are never committed. Keep `.env.example` current.
- Layouts are mobile-first: usable at 360px, tap targets at least 44px. Many users are on phones with slow connections.

## Stop and ask first if

- A new dependency is needed that the spec does not list.
- The schema must differ from `docs/v2/tech-stack.md` section 5.
- The task conflicts with the docs.
- An account, API key or secret is required.

## Done means

- `npm run typecheck` and `npm run lint` pass.
- The task is ticked in `docs/v2/STATUS.md` using the spec's **STATUS line**.
- No unrelated files changed.
