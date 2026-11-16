# Roadmap

Each phase ends in something you can demo. If you stop after any phase, you still have a working project to show.

Effort is relative: S = a few days, M = about a week, L = one to two weeks.

---

## Phase 0: Foundation (S)
**Goal:** project runs locally and deploys.
- Create the Next.js + TypeScript + Tailwind project.
- Connect Convex, set up Convex Auth.
- Deploy the empty app to Netlify with the Convex backend.
- Set up ESLint, Prettier, strict TypeScript, folder structure.
- Build the public landing page (hero, how it works, sample creator cards with placeholder content, CTA for creators and brands).

**Demo:** a live URL with the landing page.

---

## Phase 1: Accounts and roles (M)
**Goal:** people can sign up as a creator or a brand.
- Sign up, sign in, sign out.
- Choose a role at signup (`creator` or `brand`); `admin` assigned manually.
- Role-based route protection and role checks inside every Convex function.
- Creator profile form: bio, categories, price per video, and social accounts (platform, page link, followers, average views).
- Brand profile form: business name, Facebook page link, category.

**Demo:** sign up as each role, fill in a profile, see role-specific dashboards.

---

## Phase 2: Creator directory and samples (L)
**Goal:** brands can browse creators and watch real sample videos.
- Set up a private Cloudflare R2 bucket with presigned uploads through a Convex action. No public URLs; all playback goes through short-lived signed URLs created after role and order-status checks.
- Creator sample upload with progress bar, size and format limits.
- Creator public profile page with samples.
- Directory page with filters (category, price range, platform, followers) and search.
- Admin approval flag so only approved creators appear publicly.

**Demo:** a creator uploads samples, an admin approves them, a brand browses and filters the directory.

---

## Phase 3: Briefs and orders (M)
**Goal:** a brand can start an order with a creator.
- Brief form with fields for product, goal, tone, requirements, reference links, and deadline.
- Product type on every brief: `none`, `reimbursed`, `keep` or `return_required`, with a declared value for shipped items.
- Creator accept window (48 hours by default) and a delivery deadline.
- Order type on every order: `post_on_page` (main), `deliver_to_brand` or `both`.
- A few ready-made brief templates (for example product review, unboxing, before/after).
- "Hire this creator" flow that creates an order in `draft` and then `awaiting_payment`.
- Creator sees incoming orders and can accept or decline.

**Demo:** a brand writes a brief, picks a creator, and the creator sees and accepts the order.

---

## Phase 4: Simulated escrow and order state machine (M)
**Goal:** the money flow works, without real money.
- Order state machine in Convex: every transition validated by current state and caller role. It includes the shipping states, the post states (`draft_submitted`, `draft_approved`, `posted`, `live_period`, `completed`, `removed_early`), the `expired`, `disputed` and `refunded` states, and timers (accept window, delivery deadline, live period end, auto-refund).
- Shipment tracking: the brand adds courier and tracking number, the creator confirms receipt, and the delivery deadline starts at receipt.
- Ledger table with `hold`, `release`, `fee` and `refund` entries.
- Simulated checkout page: the brand "pays", the ledger records a hold, the order moves to `paid_in_escrow`.
- Platform fee calculated per order (start with 20%, configurable).
- Partial release: the first part of the payment at `posted` (50% by default) and the rest when the live period ends.
- Order detail page with a status timeline.

**Demo:** a brand pays, funds show as held, and the order timeline updates live for both sides.

---

## Phase 5: Draft, posting, proof, payout (L)
**Goal:** the full order loop closes.
- Creator uploads the draft video for an order. In a `deliver_to_brand` order the same upload is the final delivery.
- Brand views the preview through a signed URL and can approve the draft, request changes with written feedback, or open a dispute. In `deliver_to_brand` orders the original is released only after approval.
- Revision loop with a version history of deliveries, limited to a free number of rounds (2 by default).
- Auto-approve after a set number of days (7 by default) with reminders on day 3 and day 6. An open dispute pauses the timer.
- Post flow: after the draft is approved, the creator posts on their own page and submits the post link and a screenshot. The brand confirms, and the first part of the payment is released (50% by default), minus the fee.
- Live period: the post must stay up for a set number of days (14 by default). At the end the creator submits an insights screenshot and the brand confirms. The rest is released. If the post is removed early, the remaining held amount goes back to the brand.
- `deliver_to_brand` orders: on approval, release funds to the creator minus the fee and give the brand the original.
- Creator earnings page showing pending and paid amounts.
- Order chat or notes between brand and creator.

**Demo:** one complete order from brief to payout, shown live with two browser windows.

---

## Phase 6: Admin dashboard (M)
**Goal:** the person running the platform can see and control everything.
- List and filter all orders, users and creators.
- Approve or reject creators.
- View the ledger and totals (volume, fees earned).
- Handle disputes: freeze an order, then release or refund the held funds.
- Basic activity log of state changes.

**Demo:** an admin approves a creator, views revenue, and resolves a disputed order.

---

## Phase 7: Polish and demo-readiness (M)
**Goal:** it looks and feels like a real product.
- Seed script that fills the app with realistic demo data and sample videos.
- Mobile-friendly pass on every page, since many users will be on phones.
- Loading, empty and error states.
- Email or in-app notifications for key events (new order, delivery ready, approved).
- Bangla/English language toggle if time allows.
- Watermarked, lower-quality preview for brand review.
- Ratings and a creator track record (on-time rate, revision rate) shown in the directory.
- Trust tiers: item-value caps for new creators that rise with completed orders.
- Deposit for `return_required` items.
- Creator verification video (name and platform name) to catch stolen samples.
- Paid-partnership labeling reminder on each platform in the creator's posting checklist.
- Terms and license text shown at checkout, reviewed by a lawyer.
- Basic tests for the order state machine and role checks.
- README with screenshots, an architecture diagram, and a short demo video.

**Demo:** a clean walkthrough anyone can follow from the README.

---

## Phase 8 (optional): Real-world validation
Only if you want to see whether it could become a real business.
- Run a landing page test with a small Facebook ad budget to measure cost per lead.
- Handle 3 to 5 real orders by hand and note what breaks.
- Check the legal side (Digital Commerce Operation Guidelines 2021) before touching real money.
- Look at bKash or Nagad integration only after that.
- Consider automatic post checking through the Meta API once real creators use the platform (needs connected accounts and app review).

---

## Order of work if time runs short
1. Phases 0 to 2 give a creator marketplace with a directory.
2. Phases 3 to 5 make it a real transaction flow, and this is the core of the portfolio piece.
3. Phase 6 shows the operator side.
4. Phase 7 makes it presentable.

## Risks to watch
- **Video upload and playback** is the most likely place to lose time. Build and test it early, in Phase 2.
- **State machine bugs** around payments. Write tests before wiring up the UI.
- **Scope creep.** Ad management, scripts and content calendars are out of scope.
- **Proof of posting is manual.** Don't let Codex build scraping or Meta API checks in this version.
