# UGC Marketplace: agent rules

Bangladesh-first marketplace where UGC creators sign up and brands hire and pay them. Specs are in `/docs`: `mission.md`, `tech-stack.md`, `roadmap.md`, `STATUS.md`. Read only the section you need for the current task, never whole files.

## Start of every session
1. Read this file and `docs/STATUS.md` only.
2. Do the single task the user names. Read its spec in `docs/tasks/phase-N.md` (only that task's section). Do not pick up the next one.
3. If the task has no spec, or the spec is unclear or conflicts with the docs, stop and ask. Do not guess.

## Fixed stack (do not change)
Next.js 14+ (App Router), TypeScript strict, Tailwind, Convex + Convex Auth, Cloudflare R2 for video, Netlify. Ask before adding any dependency.

## Token and scope discipline
- Do not scan the repo. Open only the files the task needs; use grep to find symbols.
- Never read `node_modules`, `.next`, `convex/_generated`, lockfiles or build output.
- Edit files in place with small patches. Do not rewrite whole files or paste them back in replies.
- No refactors, renames or "improvements" outside the task.
- Run only the checks that matter: `npx tsc --noEmit`, lint on changed files, tests for the changed module. No full builds unless asked. Keep command output short (`| tail -n 30`).
- If a task would touch more than about 8 files or 300 lines, stop and propose a split.
- Final reply: 8 lines max. What changed, files touched, how it was verified, suggested next task.

## App rules
- Roles are `creator`, `brand`, `admin`. Check the role inside every Convex query and mutation, not only in the UI.
- Validate every Convex function argument with Convex validators. Use Zod for form input.
- Order status changes only through the single state machine module in `convex/`. Valid transitions are in `docs/tech-stack.md`.
- `post_on_page` is the main order type. Payment is released in two parts: `upfrontPercent` at `posted`, and the rest when the live period ends. A post removed early refunds the remaining held amount. Proof of posting is manual (post link, screenshots, brand confirmation). Do not build scraping or Meta API checks.
- Never store video in Convex. Upload to R2 with presigned URLs; Convex holds metadata only.
- The R2 bucket is always private. Never create a public URL. Create signed URLs only in a Convex action that checks role and order status. A brand gets an original file only in `deliver_to_brand` or `both` orders, and only once the order is `approved` or `completed`; before that, preview only (see "Video access" in `docs/tech-stack.md`).
- Timers and limits (accept window, auto-approve days, free revisions, fee percent, stay-up days, upfront percent) live in one config module. Never hard-code them.
- Payments are simulated with a ledger table. Write no real payment code and use no real keys.
- Money is stored as integer taka, never floats.
- Secrets go in env vars and are never committed. Keep `.env.example` current.
- Layouts are mobile-first. Many users will be on phones with slow connections.

## Stop and ask first if
- A new dependency is needed.
- The schema must differ from `docs/tech-stack.md`.
- The task conflicts with the docs.
- An account, API key or secret is required.

## Done means
- `npx tsc --noEmit` and lint pass.
- The task is ticked in `docs/STATUS.md` with a one-line note.
- No unrelated files changed.
