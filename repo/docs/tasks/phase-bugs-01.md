# Bug fix specs 01: sign-in flows, root layout, app name

Do the tasks in order, one per session. B.2 depends on B.1; B.5 and B.6 both edit app/layout.tsx.

Line numbers refer to commit 7ea7d27. Claims about library internals come from the bug analysis, not from this repo. Agents must not read node_modules to confirm them (AGENTS.md).

The first task done adds a "Bug fixes 01" section to docs/STATUS.md with one unticked line per task (B.1 to B.6). Each task ticks its own line.

## B.1 Proxy checks auth through its own context

**Goal:** the proxy decides redirects from the session it has just refreshed.

**Bug:** proxy.ts:14-15 ignores the handler's second argument and calls `isAuthenticatedNextjs()`, which is for Server Components and reads the wrong cookie source inside a proxy. This is behind both the stuck role choice (B.2) and the sign-out error (B.3, B.4).

**Build:**
- proxy.ts: accept `(request, ctx)` and use `await ctx.isAuthenticated()`.
- Remove the unused `isAuthenticatedNextjs` import. Keep the paths, redirects and matcher as they are.

**Files:** proxy.ts, docs/STATUS.md

**Data:** none

**Allowed new dependencies:** none

**Acceptance (how to check it):**
- Signed out: /dashboard, /onboarding, /brand, /creator and /admin go to /signin.
- Signed in: /signin and /signup go to /dashboard.
- `npx tsc --noEmit` and lint pass.

**Out of scope:** lib/convexAuth.tsx, page-level redirects, caching config.

## B.2 Role choice never sticks on "Saving…"

**Goal:** picking a role either reaches the role dashboard or leaves a visible way forward.

**Bug:** components/auth/RoleChoice.tsx:30-41 clears `pendingRole` only in `catch`, so if `router.push("/dashboard")` does not land, the button stays on "Saving…". Line 37 also discards the error.

**Build:**
- After `setRole` succeeds: clear `pendingRole`, record a saved state, keep both buttons disabled, call `router.push("/dashboard")`, and show a "Continue to your dashboard" link to /dashboard.
- On failure: `console.error` the caught error, keep the readable message, re-enable the buttons.

**Files:** components/auth/RoleChoice.tsx, docs/STATUS.md

**Data:** users.role, written by the existing `setRole` (unchanged)

**Allowed new dependencies:** none

**Acceptance (how to check it):**
- A new creator lands on /creator and a new brand on /brand, with no manual reload.
- With /onboarding open in two tabs, picking in the second after the first shows the message and logs the real error.
- If the push still does not land after B.1, stop and report. Next suspect (unproven): app/dashboard/page.tsx:7-19, a request-time read then `redirect()` with `partialPrefetching: true`.
- `npx tsc --noEmit` and lint pass.

**Out of scope:** convex/users.ts, app/dashboard/page.tsx, restyling.

## B.3 Profile queries return null instead of throwing

**Goal:** losing the session on a profile page gives an empty state, not a crash.

**Bug:** `getMine` (convex/creatorProfiles.ts:26, convex/brandProfiles.ts:11) uses `requireRole`, which throws "You must be signed in to do that." (convex/lib/roles.ts:14). A throwing `useQuery` throws during render. `me` (convex/users.ts:23-26) already returns null.

**Build:**
- Both `getMine`: return null when there is no identity, no role or the wrong role, still checking the role before reading. This replaces the "getMine starts with requireRole" line in phase-1.md 1.4 and 1.5.
- Both forms: also read `api.users.me`. Show loading while either query is undefined, and a "Sign in as a creator/brand" link to /signin when the role does not match. Mount the fields only when it matches, so a null from a signed-out moment never becomes a blank form over a saved profile.

**Files:** convex/creatorProfiles.ts, convex/brandProfiles.ts, components/creator/CreatorProfileForm.tsx, components/brand/BrandProfileForm.tsx, docs/STATUS.md

**Data:** creatorProfiles, brandProfiles (read only, no schema change)

**Allowed new dependencies:** none

**Acceptance (how to check it):**
- With a profile page open in one tab, signing out in another shows no error; signing in again shows the saved values.
- `upsertMine` still rejects signed-out and wrong-role callers.
- `npx convex dev` pushes; `npx tsc --noEmit` and lint pass.

**Out of scope:** `upsertMine`, convex/lib/roles.ts, form layout or validation.

## B.4 Sign out recovers from failure and drops signed-in UI

**Goal:** sign out ends on / with no stale signed-in pages, or says that it failed.

**Bug:** components/auth/SignOutButton.tsx:12-16 has no try/catch, never resets `pending`, and calls `router.push("/")` without `router.refresh()`, so cached signed-in pages can reappear.

**Build:**
- Wrap `signOut()` in try/catch. On success call `router.push("/")`, then `router.refresh()`.
- On failure: `console.error` the error, reset `pending`, show a short readable message.

**Files:** components/auth/SignOutButton.tsx, docs/STATUS.md

**Data:** none

**Allowed new dependencies:** none

**Acceptance (how to check it):**
- From /creator, /brand and /admin, sign out lands on /. Back does not show signed-in UI.
- Visit the profile page, go back to the dashboard, sign out: no "must be signed in" error. If it still appears (after B.3), stop and report.
- With the network offline, the button becomes usable again and shows the message.
- `npx tsc --noEmit` and lint pass.

**Out of scope:** app/auth/signout/route.ts (wired correctly), the dashboard pages.

## B.5 Root layout has a prerenderable shell

**Goal:** the instant-UI validation error at app/layout.tsx:29 is gone.

**Bug:** `<Suspense>` has no `fallback` and wraps `ConvexAuthNextjsServerProvider`, which reads cookies at request time. With `cacheComponents` and `partialPrefetching` on, there is no shell to prerender.

**Decision:** give the boundary a fallback. Do not move it below the provider: the provider's request-time read would then have no Suspense boundary above it.

**Build:**
- Add a static fallback: a full-height, centred "Loading…" with `role="status"`. It must not render `children`, read request data or use Convex hooks.

**Files:** app/layout.tsx, docs/STATUS.md

**Data:** none

**Allowed new dependencies:** none

**Acceptance (how to check it):**
- `npm run dev`: no instant-UI validation error on /, /signin or /dashboard. If one remains, stop and report it.
- `npx tsc --noEmit` and lint pass.

**Out of scope:** changing next.config.ts, opting routes out of validation, per-page skeletons, moving the provider so the landing page prerenders in full.

## B.6 Show the real app name

**Goal:** no page, tab title or search result shows the literal text "APP_NAME".

**Bug:** components/landing/Header.tsx:1 and Footer.tsx:1 declare a local `APP_NAME = "APP_NAME"`. app/layout.tsx:18 has it inside the title string.

**Build:**
- Header.tsx and Footer.tsx: delete the local constant and import `APP_NAME` from `@/lib/config`.
- app/layout.tsx: build the title as `${APP_NAME} | Bangladesh UGC marketplace`.

**Files:** components/landing/Header.tsx, components/landing/Footer.tsx, app/layout.tsx, docs/STATUS.md

**Data:** none

**Allowed new dependencies:** none

**Acceptance (how to check it):**
- Header, footer and browser tab on / show "UGC Marketplace".
- `npx tsc --noEmit` and lint pass.

**Out of scope:** changing the name itself, the hard-coded name in RoleChoice.tsx:47, other copy or styling.
