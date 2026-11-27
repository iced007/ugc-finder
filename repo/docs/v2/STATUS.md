# Status

The checklist. Tick a task and add a one-line note at the end of every task (each spec gives the exact **STATUS line**). Sessions start from this file instead of re-reading the repo.

What to build for each task is in `docs/v2/tasks/phase-N.md`. A task with no spec there must not be started.

**Current focus:** Bug fixes 02, next is B.8. Not yet confirmed for B.7: saving a creator profile with price 499 shows the minimum-price error. Not yet confirmed for 2.6: sample playback on a public profile (the only approved creator has no ready samples) and the 404 page for a real unapproved creator (only a malformed ID was tried). Upload, playback and deletion were tested by hand. Not yet confirmed: playback access for other viewers and 403 after URL expiry (2.3); in-browser size and length limits, brand redirect and 360px layout (2.4); admin review list in the browser, approve and unapprove, and creator/brand rejection (2.5). Not yet confirmed for 2.7: the checks with three approved creators (only two exist), platform and follower filters keeping a matching creator, and unapproved creators staying hidden.
**Queued for Phase 2:** 2.8 and 2.9 (separate sample approval). They edit convex/samples.ts and convex/sampleActions.ts, the same files as B.10 and B.11, so do them after those fixes.
**Open issues:** B.5 and the items in [known-issues.md](known-issues.md). Check the issues list before a task that touches the same files.

Specs for finished phases stay in the old folder as history: `docs/tasks/phase-0.md`, `docs/tasks/phase-1.md`, `docs/tasks/phase-bugs-01.md`.

## Phase 0: Foundation

- [x] 0.1 Scaffold Next.js + TypeScript + Tailwind, init Convex, dev server runs — App Router scaffolded; Convex dependency and folder added.
- [x] 0.2 Folder structure, ESLint, Prettier, `.env.example` — Component and config folders, formatting scripts, Convex env template.
- [x] 0.3 Landing page: header, hero, footer — Responsive header, hero and footer with CTAs.
- [x] 0.4 Landing page: how it works, placeholder creator cards, creator and brand CTAs — Four-step flow, six placeholder cards, bottom CTAs.
- [x] 0.5 Deploy frontend to Netlify and backend to Convex cloud — `netlify.toml` deploys Convex before building Next.js.

## Phase 1: Accounts and roles

- [x] 1.1a Auth backend (Convex) — Convex Auth v2 Username + Password backend.
- [x] 1.1b Auth wiring in Next.js — SSR auth handlers, provider, session-refresh proxy.
- [x] 1.1c Sign up, sign in, sign out pages — Responsive auth pages, readable errors, sign-out control, landing links.
- [x] 1.2 Role choice after first sign-in, role helpers for Convex functions — One-time creator/brand onboarding; `requireUser` and `requireRole`.
- [x] 1.3 Route protection and role-based dashboards — Proxy redirects and role-specific dashboard pages.
- [x] 1.4 Creator profile form — creatorProfiles table, role-checked getMine/upsertMine, Zod schema, saved form.
- [x] 1.5 Brand profile form — brandProfiles table, role-checked getMine/upsertMine, Zod schema, saved form.
- [ ] 1.6 Dashboard styling for creators and brands — Built: shared DashboardShell, profile status and stat cards; typecheck and lint pass. Needs a browser check at 360px before ticking.

## Bug fixes 01

- [x] B.1 Proxy checks auth through its own context — Uses `ctx.isAuthenticated()`.
- [x] B.2 Role choice never sticks on "Saving…" — Dashboard link stays visible after saving; failures logged.
- [x] B.3 Profile queries return null instead of throwing — Both `getMine` return null for the wrong role; forms show a sign-in link.
- [x] B.4 Sign out recovers from failure and drops signed-in UI — Failures show a message; success refreshes the router.
- [ ] B.5 Root layout has a prerenderable shell — Fallback added, but the instant-UI error at app/layout.tsx:29 remains on /signin. Needs a new spec (see K.7).
- [x] B.6 Show the real app name — Header, footer and title use `APP_NAME`.

## Bug fixes 02

- [x] B.7 Limits in one config module — price and social-account limits moved to convex/lib/config.ts
- [ ] B.8 Root layout passes instant-UI validation
- [ ] B.10 Clean up stale pending samples and late uploads
- [ ] B.11 An upload URL cannot replace a sample
- [ ] B.12 Public creator page metadata error
- [ ] B.13 Landing header works on every page

## Phase 2: Creator directory and samples

- [x] 2.1 R2 bucket, config module and signing helper — aws4fetch signer, convex/lib/config.ts, R2 env vars documented
- [x] 2.2 Sample upload backend — sampleVideos table, presigned upload, confirm and delete with ownership checks
- [x] 2.3 Signed playback for samples — role-checked short-lived URLs and a SignedVideo player
- [x] 2.4 Sample upload UI — uploader with progress and limits, sample list with playback and delete
- [x] 2.5 Admin creator approval — admin review list with samples, approve and unapprove
- [x] 2.6 Public creator profile page — approved-only public query and /creators/[profileId]
- [x] 2.7 Creator directory — /creators with URL-based filters, search and load more
- [ ] 2.8 Sample review backend
- [ ] 2.9 Sample review UI

## Phase 3: Briefs and orders

- [ ] 3.1 Brief form with product type, declared value and templates
- [ ] 3.2 Hire flow creates an order with an order type (`post_on_page`, `deliver_to_brand`, `both`)
- [ ] 3.3 Creator's incoming orders list (read-only)

## Phase 4: Simulated escrow and state machine

- [x] 4.1 Test runner set up — vitest and convex-test, first creatorProfiles tests
- [ ] 4.2 State machine module with tests for every transition and role
- [ ] 4.3 Ledger table, fee calculation and split release
- [ ] 4.4 Simulated checkout
- [ ] 4.5 Creator accepts or declines within the accept window
- [ ] 4.6 Shipment tracking: courier, tracking number, receipt confirmation
- [ ] 4.7 Scheduled timers: accept window and delivery deadline
- [ ] 4.8 Order detail page with timeline

## Phase 5: Draft, posting, proof, payout

- [ ] 5.1 Draft upload (original and preview keys)
- [ ] 5.2 Brand reviews the preview: approve, request changes or open a dispute
- [ ] 5.3 Revision loop with versions and free-revision limit
- [ ] 5.4 Post flow: post link and screenshot, brand confirmation, upfront release
- [ ] 5.5 Live period: insights screenshot, brand confirmation, final release; early removal refunds the rest
- [ ] 5.6 `deliver_to_brand` orders: payout on approval and original released
- [ ] 5.7 Auto-approve and auto-confirm timers with day 3 and day 6 reminders; dispute pauses them
- [ ] 5.8 Creator earnings page
- [ ] 5.9 Order notes between brand and creator

## Phase 6: Admin dashboard

- [ ] 6.1 Lists and filters for orders, users and creators
- [ ] 6.2 Ledger view and totals
- [ ] 6.3 Dispute handling: freeze, then refund, partial refund, revision or release
- [ ] 6.4 Activity log of state changes

## Phase 7: Polish

- [ ] 7.1 Seed script
- [ ] 7.2 Mobile pass; loading, empty and error states
- [ ] 7.3 Notifications
- [ ] 7.4 Watermarked, lower-quality previews and public samples
- [ ] 7.5 Ratings and creator track record
- [ ] 7.6 Trust tiers and deposit for `return_required` items
- [ ] 7.7 Creator verification video
- [ ] 7.8 Terms and license text (lawyer review)
- [ ] 7.9 Paid-partnership labeling reminder in the posting checklist
- [ ] 7.10 Bangla/English toggle (if time allows)
- [ ] 7.11 README, screenshots, architecture diagram, demo video
