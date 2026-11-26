# Roadmap

Each phase ends in something you can demo. Stop after any phase and you still have a working project.

Effort: S = a few days, M = about a week, L = one to two weeks. What is done is tracked in [STATUS.md](STATUS.md). How things work is in [tech-stack.md](tech-stack.md).

| Phase | Name | Effort | Status |
| --- | --- | --- | --- |
| 0 | Foundation | S | done |
| 1 | Accounts and roles | M | done (1.6 awaiting a browser check) |
| 2 | Creator directory and samples | L | next |
| 3 | Briefs and orders | M | |
| 4 | Simulated escrow and state machine | M | |
| 5 | Draft, posting, proof, payout | L | |
| 6 | Admin dashboard | M | |
| 7 | Polish and demo-readiness | M | |
| 8 | Real-world validation (optional) | | |

---

## Phase 0: Foundation (S), done

**Goal:** the project runs locally and deploys.

- Next.js, TypeScript, Tailwind and Convex scaffolded; ESLint, Prettier and strict TypeScript set up.
- Netlify deploys the frontend and Convex cloud the backend.
- Public landing page: hero, how it works, placeholder creator cards, creator and brand CTAs.

**Demo:** a live URL with the landing page.

---

## Phase 1: Accounts and roles (M), done

**Goal:** people can sign up as a creator or a brand.

- Username + Password sign up, sign in and sign out (Convex Auth v2).
- One-time role choice after first sign-in; `admin` set by hand.
- Route protection in `proxy.ts` and role checks inside Convex functions.
- Creator profile: display name, bio, categories, price, social accounts.
- Brand profile: business name, Facebook page link, category.
- Shared dashboard shell for creators and brands showing profile state.

**Demo:** sign up as each role, fill in a profile, see role-specific dashboards.

---

## Phase 2: Creator directory and samples (L)

**Goal:** brands can browse approved creators and watch their sample videos.

- Private R2 bucket; presigned uploads and short-lived signed playback through Convex actions.
- Sample upload with progress bar and limits on size, length and format.
- Admin approves or unapproves creators. Only approved creators appear publicly.
- Public creator profile page with samples and social accounts.
- Directory with filters (category, price, platform, followers) and search.

**Depends on:** Phase 1.
**Manual steps:** create a Cloudflare account and R2 bucket, set CORS, create an API token, set four Convex env vars (task 2.1).
**New dependency:** `aws4fetch`.
**Demo:** a creator uploads samples, an admin approves them, a brand filters the directory and watches a sample.

Specs: [tasks/phase-2.md](tasks/phase-2.md).

---

## Phase 3: Briefs and orders (M)

**Goal:** a brand can start an order with a creator.

- Brief form: product, goal, tone, requirements, reference links, deadline.
- Product type on every brief (`none`, `reimbursed`, `keep`, `return_required`) with a declared value for shipped items.
- A few brief templates (product review, unboxing, before/after).
- "Hire this creator" flow: choose an order type (`post_on_page`, `deliver_to_brand`, `both`) and create the order in `draft`, then `awaiting_payment`.
- Creator's incoming orders list (read-only until payment exists).

**Depends on:** Phase 2 (directory and profile page to hire from).
**Demo:** a brand writes a brief, hires a creator, and the creator sees the request.

Accepting and declining move to Phase 4, because the state machine has the creator accept after payment (see tech-stack, section 7).

---

## Phase 4: Simulated escrow and state machine (M)

**Goal:** the money flow works without real money.

- State machine module with tests for every transition in tech-stack section 7, including role checks.
- Ledger table with `hold`, `release`, `fee` and `refund`; fee and split rules from section 7.
- Simulated checkout: the brand "pays", the ledger records a hold, the order moves to `paid_in_escrow`.
- Creator accepts or declines within the accept window.
- Shipment tracking: courier, tracking number, receipt confirmation; the delivery deadline starts at receipt.
- Scheduled timers: accept window, delivery deadline.
- Order detail page with a live status timeline for both sides.

**Depends on:** Phase 3.
**New dependency (ask first):** a test runner, for example `vitest` with `convex-test`.
**Demo:** a brand pays, the creator accepts, funds show as held, and the timeline updates live on both sides.

---

## Phase 5: Draft, posting, proof, payout (L)

**Goal:** the full order loop closes.

- Creator uploads the draft (or, for `deliver_to_brand`, the final video) to R2 with original and preview keys.
- Brand watches the preview and approves, requests changes or opens a dispute.
- Revision loop with version history, limited to `maxFreeRevisions`.
- Post flow: post link and screenshot, brand confirmation, upfront release.
- Live period: insights screenshot at the end, brand confirmation, final release. Early removal refunds the rest.
- `deliver_to_brand`: payout on approval and the original released to the brand.
- Auto-approve and auto-confirm timers with day 3 and day 6 reminders; a dispute pauses them.
- Creator earnings page (pending and paid). Order notes between brand and creator.

**Depends on:** Phases 2 (R2) and 4.
**Demo:** one complete order from brief to payout, shown live in two browser windows.

---

## Phase 6: Admin dashboard (M)

**Goal:** the operator can see and control everything.

- Lists and filters for all orders, users and creators. (Creator approval itself is built in Phase 2.)
- Ledger view and totals: volume, fees earned.
- Disputes: freeze an order, then refund, partially refund, allow another revision or release.
- Activity log of state changes.

**Depends on:** Phase 5.
**Demo:** an admin views revenue and resolves a disputed order.

---

## Phase 7: Polish and demo-readiness (M)

**Goal:** it looks and feels like a real product.

- Seed script with realistic demo data and sample videos.
- Mobile pass on every page; loading, empty and error states.
- In-app or email notifications for key events.
- Watermarked, lower-quality previews for brand review and public samples.
- Ratings and creator track record (on-time rate, revision rate) in the directory.
- Trust tiers with item-value caps for new creators; deposit for `return_required` items.
- Creator verification video to catch stolen samples.
- Paid-partnership labeling reminder in the creator's posting checklist.
- Terms and license text at checkout, reviewed by a lawyer.
- Bangla/English toggle if time allows.
- README with screenshots, an architecture diagram and a short demo video.

**Demo:** a clean walkthrough anyone can follow from the README.

---

## Phase 8 (optional): Real-world validation

- Landing page test with a small Facebook ad budget to measure cost per lead.
- Handle 3 to 5 real orders by hand and note what breaks.
- Legal check (Digital Commerce Operation Guidelines 2021) before any real money.
- bKash or Nagad integration only after that.
- Automatic post checking through the Meta API once real creators use the platform.

---

## If time runs short

1. Phases 0 to 2: a creator marketplace with a directory.
2. Phases 3 to 5: a real transaction flow, the core of the portfolio piece.
3. Phase 6: the operator side.
4. Phase 7: presentation.

## Risks to watch

- **Video upload and playback** is where time is most likely lost. It is built early, in Phase 2.
- **State machine bugs** around money. Write the tests before the UI (Phase 4).
- **Scope creep.** Ad management, scripts and content calendars stay out.
- **Proof of posting is manual.** No scraping or Meta API checks in this version.
