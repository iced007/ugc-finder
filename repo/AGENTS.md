# UGC Marketplace: agent rules

Bangladesh-first marketplace where brands hire UGC creators to post on their own pages and pay through the platform. All project docs are in `docs/v2/`. Ignore `docs/*.md` outside `v2/`; they are the old version. `docs/tasks/` holds the finished Phase 0, 1 and bug-fix specs as history only.

| File | Read it for |
| --- | --- |
| `docs/v2/STATUS.md` | What is done and what is next |
| `docs/v2/tasks/phase-N.md` | The spec for your task (only that task's section) |
| `docs/v2/tech-stack.md` | Only the numbered sections your spec names |
| `docs/v2/known-issues.md` | Only the issues that name a file in your spec's **Files** (find them with grep; see below) |
| `docs/v2/mission.md`, `docs/v2/roadmap.md` | Product context; rarely needed for a task |
| `docs/v2/tasks/task-template.md` | Writing a new spec |

## Start of every session

Follow these steps in order. Read nothing that a step does not name.

1. Read this file and `docs/v2/STATUS.md`.
2. Do only the task the user names. Do not start, prepare or suggest code for any other task.
3. Print only that task's section, never the whole spec file. Example for 2.5: `sed -n '/^## 2\.5 /,/^## /p' docs/v2/tasks/phase-2.md`.
4. Read only what that section names:
   - every file and doc section under **Reads**. For `tech-stack.md`, print only the named sections, the same way as step 3;
   - every existing file under **Files**, because you will edit it;
   - a file that the **Build** text names as a pattern (for example "role check like `app/creator/page.tsx`").
5. Known issues: run `grep -n` on `docs/v2/known-issues.md` for each path under **Files**. Read only the issues that match. If nothing matches, do not open the file.
6. Need any other file (a pattern to copy, a type, a component to check)? Stop and ask the user, naming the file and the reason. You may grep for where a symbol is defined, but read only the matching lines.
7. If the task has no spec, the spec is unclear or conflicts with the docs, or this file does not cover a situation: stop and ask. Do not guess, pick a default or find a workaround.

## Fixed stack (do not change)

Next.js 16 (App Router, `proxy.ts` not middleware), React 19, TypeScript strict, Tailwind 4, Convex + Convex Auth v2 (Username + Password), Zod 4, Cloudflare R2 for video, Netlify. Versions and layout: `docs/v2/tech-stack.md` sections 1 and 2. Ask before adding any dependency.

## Token and scope discipline

- Do not scan or list the repo. Open only the files allowed by "Start of every session".
- Never read `node_modules`, `.next`, `convex/_generated`, lockfiles or build output, by any means (Read, `cat`, `grep`, `ls` included).
- If typecheck says a `convex/_generated` member is missing, `npx convex dev` has not synced yet. Rerun typecheck once. If it still fails, ask the user to check `npx convex dev`. Do not open the generated files.
- Never print a whole file or a full diff in the terminal. Use `git diff --stat`, and end every command that can print many lines with `| tail -n 30`.
- Edit files in place with small patches. Do not rewrite whole files or paste them back in replies.
- No refactors, renames or "improvements" outside the task, even for issues in `known-issues.md`.
- Checks: `npm run typecheck`, then `npm run lint` on the changed files. No test runner exists yet. No full builds unless asked.
- If a task would touch more than 8 files or 300 changed lines, stop and propose a split before writing code.

## Scope of changes

- Change only the files under the spec's **Files**, plus what `npx convex dev` regenerates. Any other file: stop and ask.
- Never delete, move or rename a file, and never commit, push or switch branches, unless the user tells you to in this session.
- Never change data in a Convex deployment (mutations through `npx convex run`, `npx convex import`, or edits in the dashboard) unless the spec's **Manual steps** or **Acceptance** says to.

## Verification

- Run the checks above. Then check each **Acceptance** item only in the way the spec describes.
- If an item needs a sign-in, a password, an account or a manual step you cannot do, do not test it another way (for example, never fake a user with `npx convex run --identity`). List it under "Not verified" in the final reply.
- Never type a password into a page or command, even one the user gives you. Ask the user to sign in themselves.

## Final reply

Use exactly these six lines and nothing else:

```
Done: <task number and name>
Changed: <files>
Verified: <checks and Acceptance items that passed>
Not verified: <Acceptance items not checked, or "none">
Rule problems: <any rule in this file you broke or could not follow, or "none">
Next: <next unticked task in STATUS.md>
```

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
- A file outside the spec's **Reads** and **Files** is needed, to read or to change.
- This file does not cover the situation.

## Done means

- `npm run typecheck` and `npm run lint` pass.
- In `docs/v2/STATUS.md`, change exactly two things. Replace the task's line with `- [x] ` and the spec's **STATUS line**. In **Current focus**, name the next task and list the Acceptance items that were not verified. Change nothing else in that file.
- No file outside the spec's **Files** changed, except what `npx convex dev` regenerates.
