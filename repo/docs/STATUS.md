# Status

Update this file at the end of every task: tick the box and add a one-line note. Sessions start from this file instead of re-reading the repo.

This file is only the checklist. What to build for each task is in `docs/tasks/phase-N.md`. A task with no spec there must not be started.

## Phase 0: Foundation
- [x] 0.1 Scaffold Next.js + TypeScript + Tailwind, init Convex, dev server runs — App Router scaffolded; Convex dependency and folder added (linking remains the required manual step).
- [x] 0.2 Folder structure, ESLint, Prettier, `.env.example` — Added component and config folders, formatting scripts, and the Convex environment template.
- [ ] 0.3 Landing page: header, hero, footer
- [ ] 0.4 Landing page: how-it-works, placeholder creator cards, creator and brand CTAs
- [ ] 0.5 Deploy frontend to Netlify and backend to Convex cloud

## Phase 1: Accounts and roles
- [ ] 1.1 Convex Auth sign up, sign in, sign out
- [ ] 1.2 Role chosen at signup, stored on user, role helper for Convex functions
- [ ] 1.3 Route protection and role-based dashboards
- [ ] 1.4 Creator profile form (bio, categories, price, social accounts)
- [ ] 1.5 Brand profile form

## Phase 2: Creator directory and samples
- [ ] 2.1 Private R2 bucket, presigned upload action, signed playback action with role and status checks
- [ ] 2.2 Sample video upload UI with limits
- [ ] 2.3 Creator public profile page with social accounts
- [ ] 2.4 Directory with filters (category, price, platform, followers) and search
- [ ] 2.5 Admin approval flag

## Phase 3: Briefs and orders
- [ ] 3.1 Brief form with product type, declared value and templates
- [ ] 3.2 Hire flow creates order, with order type (`post_on_page`, `deliver_to_brand` or `both`)
- [ ] 3.3 Creator accepts or declines
- [ ] 3.4 Accept window and delivery deadline fields, config module for timers and limits

## Phase 4: Simulated escrow and state machine
- [ ] 4.1 State machine module with tests (shipping, post, expired, disputed, refunded and removed_early states included)
- [ ] 4.2 Ledger table, fee calculation and partial release (upfront share at `posted`, rest at the end of the live period)
- [ ] 4.3 Simulated checkout
- [ ] 4.4 Order detail page with timeline
- [ ] 4.5 Shipment tracking: courier, tracking number, receipt confirmation
- [ ] 4.6 Scheduled timers: accept window, delivery deadline, live period end, auto-refund

## Phase 5: Draft, posting, proof, payout
- [ ] 5.1 Draft upload (original and preview keys)
- [ ] 5.2 Brand reviews the preview: approve the draft, request changes or open a dispute
- [ ] 5.3 Revision loop with versions and free-revision limit
- [ ] 5.4 Post flow: post link and screenshot, brand confirmation, first payment released
- [ ] 5.5 Live period: insights screenshot, brand confirmation, final release; early removal refunds the remainder
- [ ] 5.6 `deliver_to_brand` orders: payout on approval and original released
- [ ] 5.7 Creator earnings page
- [ ] 5.8 Order notes or chat
- [ ] 5.9 Auto-approve and auto-confirm timers with day 3 and day 6 reminders; dispute pauses them

## Phase 6: Admin dashboard
- [ ] 6.1 Lists and filters
- [ ] 6.2 Creator approval
- [ ] 6.3 Ledger and totals
- [ ] 6.4 Dispute handling
- [ ] 6.5 Dispute decisions: refund, partial refund or release

## Phase 7: Polish
- [ ] 7.1 Seed script
- [ ] 7.2 Mobile pass
- [ ] 7.3 Loading, empty and error states
- [ ] 7.4 Notifications
- [ ] 7.5 State machine and role tests
- [ ] 7.6 README, screenshots, demo video
- [ ] 7.7 Watermarked, lower-quality preview
- [ ] 7.8 Ratings and creator track record
- [ ] 7.9 Trust tiers and deposit for `return_required` items
- [ ] 7.10 Creator verification video
- [ ] 7.11 Terms and license text (lawyer review)
