Phase 1 task specs: Accounts and roles

Assumes Phase 0 is done as specified: Next.js app in the repo root with no src/ folder and the @/* alias, lib/config.ts exporting APP_NAME, components/landing/Header.tsx, Hero.tsx and CtaBand.tsx, and Convex linked.

Decisions behind this phase:

Auth is Convex Auth v2 with Username + Password. v2 email sign-up needs an email service (Resend key and a verified domain), which adds accounts and secrets. Trade-off: no password reset and no email on file. Fine for the portfolio build.
The role is chosen on a one-time screen right after the first sign-in, not on the sign-up form, because the v2 docs show no way to pass extra fields at sign-up. admin is never selectable in the app; it is set by hand in the Convex dashboard.
The docs show src/lib/... paths. This project has no src/, so use lib/... instead.
The auth docs are at https://docs.convex.dev/auth/convex-auth . Use v2 only. Older tutorials describe v1 (npx @convex-dev/auth, JWT_PRIVATE_KEY, JWKS, convexAuthNextjsMiddleware, @auth/core). Ignore them.

1.1a Auth backend (Convex)

Goal: Convex Auth v2 with Username + Password is set up on the Convex side and pushed to the dev deployment.

Reads: https://docs.convex.dev/auth/convex-auth/getting-started and https://docs.convex.dev/auth/convex-auth/methods/username-password . If you cannot open them, stop and tell me; do not work from memory.

Build:

- Install @convex-dev/auth.
- convex/convex.config.ts: register the core, password and username components, as the guides show.
- convex/auth.config.ts and convex/auth.ts exactly as the guides show (exports signOut, refreshSession, isAuthenticated, signUpWithUsernamePassword, signInWithUsernamePassword, changePassword).
- convex/users.ts: the createUser internal mutation from the username-password guide.
- convex/schema.ts: users table with one optional field, role: "creator", "brand" or "admin".
- In docs/STATUS.md, replace the single line for 1.1 with three unticked lines: 1.1a Auth backend (Convex), 1.1b Auth wiring in Next.js, 1.1c Sign up, sign in, sign out pages. Then tick 1.1a.

Data: docs/tech-stack.md lists name, email and avatar on users. With Username + Password none of those exist, so users has only role. This is expected; do not stop for it.

Files: convex/convex.config.ts, convex/auth.config.ts, convex/auth.ts, convex/users.ts, convex/schema.ts, package.json, docs/STATUS.md

Allowed new dependencies: @convex-dev/auth only

Manual step for the user: run npx convex dev and leave it running until functions are ready. Codex must not set env vars or log in anywhere. If the guides ask for an env var or secret, stop and tell me.

Acceptance:

- npx convex dev pushes with no errors.
- npm run typecheck and lint pass.
- docs/STATUS.md shows 1.1a, 1.1b, 1.1c, with only 1.1a ticked.

Out of scope: Next.js code, pages, role-setting, email, password reset.

1.1b Auth wiring in Next.js

Goal: the Next.js app can create and refresh sessions against Convex.

Reads: https://docs.convex.dev/auth/convex-auth/ssr-nextjs/setup (the Next.js parts only; the backend part was done in 1.1a), convex/auth.ts.

Build:

- First check the installed next version in package.json. The docs use proxy.ts (Next 16 and later). If it is older, stop and tell me.
- lib/serverAuth.ts: setupConvexAuthServer with convexUrl from process.env.NEXT_PUBLIC_CONVEX_URL and a signIn allowlist of every function that creates a session (expected: signUpWithUsernamePassword, signInWithUsernamePassword).
- app/auth/signin/route.ts, app/auth/refresh/route.ts, app/auth/signout/route.ts: the POST handlers the docs show.
- lib/convexAuth.tsx: setupConvexAuthNextjs, exporting the helpers the docs list.
- proxy.ts in the project root: default export convexAuthNextjsProxy with a callback that does NO redirects yet. Keep /auth and Next internals out of the matcher.
- app/layout.tsx: wrap children in ConvexAuthNextjsServerProvider inside <Suspense>, replacing any other Convex provider.

Files: lib/serverAuth.ts, lib/convexAuth.tsx, app/auth/signin/route.ts, app/auth/refresh/route.ts, app/auth/signout/route.ts, proxy.ts, app/layout.tsx

Allowed new dependencies: none

Acceptance:

- npm run dev starts and the landing page still renders.
- curl -i -X POST localhost:3000/auth/signin does not return 404.
- npm run typecheck and lint pass.

Out of scope: pages, redirects, role logic.

1.1c Sign up, sign in, sign out pages

Goal: a person can create an account, sign out and sign back in.

Reads: https://docs.convex.dev/auth/convex-auth/methods/username-password (client hooks), https://docs.convex.dev/auth/convex-auth/ssr-nextjs/methods (Next.js variant), lib/config.ts (for APP_NAME).

Build:

- app/signup/page.tsx and app/signin/page.tsx: a centered card showing APP_NAME (import it from @/lib/config, never hard-code the name), username and password fields, a submit button with a pending state, and a link to the other page.
- components/auth/AuthForm.tsx: the shared client form using useSignUpWithUsernamePassword and useSignInWithUsernamePassword. Turn the hooks' userError values into plain messages (username taken, password too short, wrong username or password, too many attempts with the wait time). Never show raw error objects.
- On success go to /dashboard with router.push. A 404 there is expected until 1.3.
- components/auth/SignOutButton.tsx: signs out, then goes to /.
- Change href values only: "Sign in" in components/landing/Header.tsx goes to /signin; the two buttons in Hero.tsx and CtaBand.tsx both go to /signup.

Files: app/signup/page.tsx, app/signin/page.tsx, components/auth/AuthForm.tsx, components/auth/SignOutButton.tsx, components/landing/Header.tsx, components/landing/Hero.tsx, components/landing/CtaBand.tsx

Allowed new dependencies: none

Acceptance:

- Sign up with a new username, sign out, sign in again. A row appears in the users table in the Convex dashboard.
- A wrong password shows a readable message and nothing crashes.
- No horizontal scroll at 360px; inputs and buttons at least 44px tall.
- npm run typecheck and lint pass.

Out of scope: role choice, redirects based on sign-in state, password reset, email, social login, remembering which button was clicked on the landing page.

1.2 Role choice and role helpers

Goal: a signed-in user with no role picks creator or brand once, and Convex functions have helpers that require a signed-in user or a role.

Reads: convex/schema.ts and convex/users.ts (from 1.1a); getAuthUserId from @convex-dev/auth/server (https://docs.convex.dev/auth/convex-auth/migrating/existing-user-data).

Build:

- convex/lib/roles.ts: export ROLES, the Role type, requireUser(ctx) (throws if signed out, returns the user document) and requireRole(ctx, allowed) (throws if signed out, role unset, or role not in allowed; returns the user document). Both use getAuthUserId.
- convex/users.ts (add): a me query returning { _id, role } or null when signed out (it must not throw), and a setRole mutation whose argument is "creator" or "brand" only. It works only if the caller's role is not set yet; otherwise it throws. It never accepts "admin".
- app/onboarding/page.tsx and components/auth/RoleChoice.tsx: two large buttons ("I'm a creator", "I'm a brand") with a one-line explanation each. On pick, call setRole and go to /dashboard. Show an error message if the call fails.

Files: convex/lib/roles.ts, convex/users.ts, app/onboarding/page.tsx, components/auth/RoleChoice.tsx

Allowed new dependencies: none

Acceptance:

- A new user opens /onboarding, picks a role, and the users row in the Convex dashboard shows it.
- Calling setRole a second time fails.
- npm run typecheck and lint pass.

Out of scope: redirects, dashboards, profile forms, setting the admin role.

1.3 Route protection and dashboards

Goal: the right people reach the right pages, and each role lands on its own dashboard.

Reads: proxy.ts and lib/convexAuth.tsx (from 1.1b), convex/users.ts (me), components/auth/SignOutButton.tsx.

Build:

- proxy.ts: signed-out users who open /dashboard, /onboarding, /brand, /creator or /admin are sent to /signin; signed-in users who open /signin or /signup are sent to /dashboard. Keep /auth out of the matcher.
- app/dashboard/page.tsx (server component): read api.users.me with the access token (queries only, no mutations on GET). No user: go to /signin. No role: go to /onboarding. Otherwise redirect to /{role}.
- app/brand/page.tsx, app/creator/page.tsx, app/admin/page.tsx: each checks that me.role matches and otherwise redirects to /dashboard. Each shows a heading ("Brand dashboard" and so on) and the sign-out button. Brand and creator pages also link to /{role}/profile (404 until 1.4 and 1.5).

Note: the proxy and these redirects only control which pages people see. The real protection is requireRole inside Convex functions.

Files: proxy.ts, app/dashboard/page.tsx, app/brand/page.tsx, app/creator/page.tsx, app/admin/page.tsx

Allowed new dependencies: none

Manual step for the user: to test the admin page, open your user row in the Convex dashboard and set role to admin.

Acceptance:

- Signed out: /dashboard goes to /signin. Signed in with no role: /dashboard goes to /onboarding.
- A creator opening /brand ends up on /creator, and the reverse for a brand. Only an admin reaches /admin.
- npm run typecheck and lint pass.

Out of scope: profile forms, navigation bar, styling beyond a heading.

1.4 Creator profile form

Goal: a creator can save and reopen their profile: name, bio, categories, price and social accounts.

Reads: convex/lib/roles.ts, convex/schema.ts, the creatorProfiles line in the data model section of docs/tech-stack.md.

Data: table creatorProfiles: userId (id of users), displayName, bio, categories (array of strings from CATEGORIES), pricePerVideo (integer taka), socialAccounts (array of { platform, pageUrl, followerCount, avgViews }), approvedByAdmin (boolean), index by_user on userId. displayName is new and is allowed here; the data model in tech-stack.md predates it.

Build:

- convex/lib/validation.ts (plain TypeScript, no Convex imports, so the browser can import it too): CATEGORIES (beauty, food, fashion, gadgets, baby), PLATFORMS (facebook, instagram, tiktok, youtube), PRICE_MIN_TAKA 500, PRICE_MAX_TAKA 100000 (starting values), MAX_SOCIAL_ACCOUNTS 4, and helpers assertHttpsUrl and assertNonNegativeInt that throw readable errors.
- convex/schema.ts: add the table and index.
- convex/creatorProfiles.ts: getMine query and upsertMine mutation, both starting with requireRole(ctx, ["creator"]). Validate every argument with Convex validators plus the helpers. Set approvedByAdmin to false on insert and never change it on update. Write only the caller's own row. No query returns anyone else's profile.
- lib/validation/creatorProfile.ts: a Zod schema built from the constants in @/convex/lib/validation.
- components/creator/CreatorProfileForm.tsx and app/creator/profile/page.tsx: load getMine, save with upsertMine. Categories as toggle chips, price in taka, add and remove social account rows (up to 4), inline field errors, a success message.

Files: convex/lib/validation.ts, convex/schema.ts, convex/creatorProfiles.ts, lib/validation/creatorProfile.ts, components/creator/CreatorProfileForm.tsx, app/creator/profile/page.tsx

Allowed new dependencies: none

Acceptance:

- Save a profile, reload, and the values are still there.
- A price of 100 or 12.5 and a link that is not https each show an error. Price is stored as an integer.
- Calling creatorProfiles.upsertMine as a brand user is rejected.
- Usable at 360px; npm run typecheck and lint pass.

Out of scope: sample videos (2.2), public profile page and directory (2.3, 2.4), admin approval (2.5), avatar image.

1.5 Brand profile form

Goal: a brand can save and reopen its business profile.

Reads: convex/lib/roles.ts, convex/lib/validation.ts (CATEGORIES, assertHttpsUrl), convex/schema.ts, the brandProfiles line in the data model section of docs/tech-stack.md. Use components/creator/CreatorProfileForm.tsx only as a model for form look and layout.

Data: table brandProfiles: userId (id of users), businessName, facebookPageUrl, category (one of CATEGORIES), index by_user on userId.

Build:

- convex/schema.ts: add the table and index.
- convex/brandProfiles.ts: getMine query and upsertMine mutation, both starting with requireRole(ctx, ["brand"]). Validate: businessName 2 to 80 characters, facebookPageUrl an https URL, category in CATEGORIES. Write only the caller's own row. No query returns anyone else's profile.
- lib/validation/brandProfile.ts: the Zod schema.
- components/brand/BrandProfileForm.tsx and app/brand/profile/page.tsx: load getMine, save with upsertMine, inline errors, a success message.

Files: convex/schema.ts, convex/brandProfiles.ts, lib/validation/brandProfile.ts, components/brand/BrandProfileForm.tsx, app/brand/profile/page.tsx

Allowed new dependencies: none

Acceptance:

- Save a profile, reload, and the values are still there. A non-https page link shows an error.
- Calling brandProfiles.upsertMine as a creator is rejected.
- Usable at 360px; npm run typecheck and lint pass.

Out of scope: logo upload, verifying the Facebook page, any page showing brands to creators.

1.6 Dashboard styling for creators and brands

Goal: the creator and brand dashboards share one clean, mobile-first look and show the state of the work from 1.3 to 1.5 (profile saved or not, key profile facts), so the app feels connected.

Reads: app/creator/page.tsx, app/brand/page.tsx, app/creator/profile/page.tsx, app/brand/profile/page.tsx, components/auth/SignOutButton.tsx, lib/config.ts (APP_NAME), the creatorProfiles.getMine and brandProfiles.getMine return shapes.

Build:

- components/dashboard/DashboardShell.tsx: shared layout with a top bar (APP_NAME, the role label, SignOutButton), a nav row (Dashboard, Profile; the active link is highlighted), and a centered content area, max width about 960px, 16px side padding. The nav links collapse into a horizontal scroll row on small screens, never a hamburger.
- components/dashboard/StatCard.tsx: a small card with a label, a value and an optional status badge (done, pending, empty). Used in a grid of one column at 360px, two from the sm breakpoint, three from lg.
- components/dashboard/ProfileStatusCard.tsx: a prominent card. No profile saved yet: "Complete your profile" with a button to /{role}/profile. Saved: "Profile ready" with an Edit link.
- app/creator/page.tsx: inside the shell, show ProfileStatusCard and stat cards for price per video (integer taka, formatted with thousands separators), number of linked social accounts, categories chosen, and review status (approvedByAdmin false is "Waiting for review", true is "Approved").
- app/brand/page.tsx: inside the shell, show ProfileStatusCard and stat cards for business name, category and Facebook page link.
- Add one "Orders" card on both dashboards with an empty state ("No orders yet"). It is a placeholder; orders arrive in Phase 3.
- app/creator/profile/page.tsx and app/brand/profile/page.tsx: wrap the existing form in the shell. Do not change the forms.
- Load profile data on the server with the same access-token pattern as 1.3 (queries only). Use Tailwind classes only: one accent color, neutral grays, rounded-lg cards, consistent spacing. No new theme file.

Files: components/dashboard/DashboardShell.tsx, components/dashboard/StatCard.tsx, components/dashboard/ProfileStatusCard.tsx, app/creator/page.tsx, app/brand/page.tsx, app/creator/profile/page.tsx, app/brand/profile/page.tsx

Data: reads creatorProfiles.getMine and brandProfiles.getMine from 1.4 and 1.5. No new tables, queries or mutations.

Allowed new dependencies: none

Acceptance:

- New creator or brand with no profile sees "Complete your profile"; after saving the profile and returning to the dashboard it shows "Profile ready" and the saved values.
- A creator's review status reads "Waiting for review" after saving.
- Dashboard and profile pages share the same top bar and nav; the active link is highlighted.
- No horizontal scroll at 360px; links and buttons at least 44px tall.
- npm run typecheck and lint pass.

Out of scope: the admin page, real order, earnings or chart data, avatar or logo upload, dark mode, animations, icon libraries, a hamburger menu, changing any Convex function.
