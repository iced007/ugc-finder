# Tech stack

Agents: read only the section a task names. Section headings are stable; specs link to them by name.

Status markers: **built** = exists in the repo; **planned** = described here, not built yet.

## 1. Stack

| Layer | Choice | Version in repo | Notes |
| --- | --- | --- | --- |
| Framework | Next.js, App Router | 16.4.6 | Uses `proxy.ts`, not `middleware.ts`. `cacheComponents` and `partialPrefetching` are on in `next.config.ts` |
| UI runtime | React | 19.3.0 | |
| Language | TypeScript, strict | ^5 | |
| Styling | Tailwind CSS | 4.3.3 | No theme file. Neutral `stone` grays, `emerald-700` accent |
| Backend and DB | Convex | ^1.50.0 | Database, server functions, scheduled functions, realtime |
| Auth | Convex Auth v2, Username + Password | ^2.1.0 | Docs: https://docs.convex.dev/auth/convex-auth (v2 only) |
| Form validation | Zod | ^4.6.7 | Forms only; Convex functions use Convex validators |
| Video storage | Cloudflare R2 | planned (Phase 2) | Private bucket, presigned URLs via `aws4fetch` |
| Hosting | Netlify (frontend), Convex cloud (backend) | | `netlify.toml` runs `npx convex deploy --cmd 'npm run build'` |

Not included on purpose: a separate backend (Convex covers it), native apps (a PWA is the next step if needed), real payment processing.

## 2. Repo layout and conventions

- No `src/` folder. Import alias `@/*` points to the repo root.
- `app/`: routes. `components/<area>/`: UI by area (`auth`, `landing`, `creator`, `brand`, `dashboard`, `ui`).
- `convex/`: functions, one file per table or feature. `convex/lib/`: shared server helpers.
- `convex/lib/validation.ts` and `convex/lib/config.ts` are plain TypeScript with no Convex imports, so the browser can import them too.
- `lib/`: frontend-only helpers. `lib/validation/<form>.ts` holds Zod schemas built from the constants in `convex/lib/`.
- Scripts: `npm run dev`, `npm run typecheck` (`tsc --noEmit`), `npm run lint`, `npm run format`. No test runner yet (one is planned for Phase 4).
- Money is integer taka everywhere. Field names stay as in the data model (for example `pricePerVideo`).

## 3. Auth and roles

- **built** Username + Password sign-up and sign-in. No email, so no password reset.
- **built** `users.role` is `creator`, `brand` or `admin`. The user picks `creator` or `brand` once on `/onboarding` after first sign-in. `admin` is set by hand in the Convex dashboard.
- **built** `proxy.ts` sends signed-out users away from `/dashboard`, `/onboarding`, `/brand`, `/creator`, `/admin` (and sub-paths) and sends signed-in users away from `/signin` and `/signup`. It only controls which pages people see.
- **built** The real protection is inside Convex, using `convex/lib/roles.ts`:
  - `requireUser(ctx)` and `requireRole(ctx, allowed)` throw. Use them in every mutation and action.
  - Queries that read a user's own data return `null` for a signed-out or wrong-role caller instead of throwing, so the UI shows an empty state rather than crashing (see bug B.3). They still check the role before reading.
  - A query with no role check is allowed only if its doc comment starts with `Public:` and it returns public fields only (approved creators, never user IDs or private keys).
- Pages that need the user on the server read `api.users.me` with `convexAuthNextjsAccessToken()` and `fetchQuery`. Queries only on GET; no mutations during render.

## 4. Config module

Every business number lives in one place, never inline.

| File | Holds | Status |
| --- | --- | --- |
| `lib/config.ts` | `APP_NAME` (UI text only) | built |
| `convex/lib/validation.ts` | `CATEGORIES`, `PLATFORMS`, `assertHttpsUrl`, `assertNonNegativeInt` | built |
| `convex/lib/config.ts` | All limits, timers and money rules below | planned (created in task 2.1) |

| Name | Value | Used from |
| --- | --- | --- |
| `PRICE_MIN_TAKA` / `PRICE_MAX_TAKA` | 500 / 100000 | Phase 1 (now in `validation.ts`, see known issue K.4) |
| `MAX_SOCIAL_ACCOUNTS` | 4 | Phase 1 (now in `validation.ts`, see K.4) |
| `SAMPLE_MAX_BYTES` | 100 MB | Phase 2 |
| `SAMPLE_MAX_SECONDS` | 90 | Phase 2 |
| `SAMPLE_CONTENT_TYPES` | `video/mp4`, `video/quicktime` | Phase 2 |
| `MAX_SAMPLES_PER_CREATOR` | 6 | Phase 2 |
| `UPLOAD_URL_TTL_SECONDS` / `PLAYBACK_URL_TTL_SECONDS` | 600 / 300 | Phase 2 |
| `DIRECTORY_PAGE_SIZE` / `DIRECTORY_SCAN_LIMIT` | 12 / 500 | Phase 2 |
| `acceptWindowHours` | 48 | Phase 4 |
| `autoApproveDays` | 7 (reminders on days 3 and 6) | Phase 5 |
| `maxFreeRevisions` | 2 | Phase 5 |
| `platformFeePercent` | 20 | Phase 4 |
| `upfrontPercent` | 50 | Phase 4 |
| `stayUpDays` | 14 | Phase 5 |

Values are starting guesses. Fee, upfront percent and stay-up days need testing with real users.

## 5. Data model

All IDs are Convex IDs. Money fields are integer taka. Timestamps are milliseconds since epoch.

| Table | Fields | Indexes | Status |
| --- | --- | --- | --- |
| `users` | `role?` (`creator`, `brand`, `admin`) | | built. Username + Password gives no name, email or avatar |
| `creatorProfiles` | `userId`, `displayName`, `bio`, `categories[]`, `pricePerVideo`, `socialAccounts[]` (`platform`, `pageUrl`, `followerCount`, `avgViews`), `approvedByAdmin` | `by_user` | built. Phase 2 adds `by_approved` and a search index on `displayName` |
| `brandProfiles` | `userId`, `businessName`, `facebookPageUrl`, `category` | `by_user` | built |
| `sampleVideos` | `creatorId` (users), `key`, `contentType`, `sizeBytes`, `durationSeconds`, `status` (`pending`, `ready`), `createdAt` | `by_creator` | planned, Phase 2 |
| `briefs` | `brandId`, `title`, `product`, `goals`, `tone`, `requirements`, `referenceLinks[]`, `deadline`, `templateId?`, `productType` (`none`, `reimbursed`, `keep`, `return_required`), `declaredValue?` | `by_brand` | planned, Phase 3 |
| `orders` | `briefId`, `brandId`, `creatorId`, `orderType`, `price`, `platformFee`, `status`, `acceptDeadline?`, `deliveryDeadline?`, `autoApproveAt?`, `revisionsUsed` | `by_brand`, `by_creator`, `by_status` | planned, Phase 3 |
| `shipments` | `orderId`, `courier`, `trackingNumber`, `shippedAt`, `receivedAt?` | `by_order` | planned, Phase 4 |
| `ledgerEntries` | `orderId`, `type` (`hold`, `release`, `fee`, `refund`), `amount`, `createdAt` | `by_order` | planned, Phase 4 |
| `deliveries` | `orderId`, `originalKey`, `previewKey`, `version`, `notes?`, `createdAt` | `by_order` | planned, Phase 5 |
| `revisions` | `orderId`, `deliveryId`, `feedback`, `createdAt` | `by_order` | planned, Phase 5 |
| `posts` | `orderId`, `platform`, `postUrl`, `postedAt`, `proofKeys[]`, `liveUntil?`, `status` (`live`, `removed_early`, `completed`), `brandConfirmedAt?` | `by_order` | planned, Phase 5 |
| `messages` | `orderId`, `senderId`, `body`, `createdAt` | `by_order` | planned, Phase 5 |
| `disputes` | `orderId`, `openedBy`, `reason`, `status`, `resolution?`, `createdAt` | `by_order`, `by_status` | planned, Phase 6 |

`categories` and `platform` are stored as strings and checked against `CATEGORIES` and `PLATFORMS` in the handler. New tables should use `v.union` of literals where the set is fixed.

A schema change not shown here needs approval first.

## 6. Video storage and access

### Storage

- Video never goes into Convex. The browser uploads straight to R2 with a presigned PUT URL from a Convex action. Convex stores metadata only.
- The bucket is private. There are no public URLs, ever.
- Keys: `samples/<userId>/<uuid>.<ext>` and `orders/<orderId>/<deliveryId>/{original,preview}.<ext>`.
- Limits come from `convex/lib/config.ts`. The client checks type, size and duration before asking for an upload URL; the server checks again. Duration is reported by the browser and is not verified on the server.
- R2 credentials live in Convex env vars only: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

### Signed URLs

- Created only in a Convex action that checks the caller's role and, for order videos, the order status. GET URLs expire after `PLAYBACK_URL_TTL_SECONDS`.
- Players use `controlsList="nodownload"` and no download link. A determined viewer can still capture a stream; the watermarked, lower-quality preview in Phase 7 is the real fix.

### Who can access what

Samples:

| Viewer | Access |
| --- | --- |
| The creator who owns them | Always, including `pending` |
| Admin | Always |
| Anyone else, signed in or not | Stream only, `ready` samples of creators with `approvedByAdmin` true |

Order videos (brand view; creators can always access their own uploads, admins can access everything for disputes):

| Order status | `post_on_page` | `deliver_to_brand` | `both` |
| --- | --- | --- | --- |
| before `draft_submitted` / `delivered` | nothing | nothing | nothing |
| `draft_submitted`, `delivered`, `revision_requested`, `disputed` | preview | preview | preview |
| `draft_approved`, `posted`, `live_period` | preview | n/a | preview |
| `approved`, `paid_out` | n/a | original | n/a |
| `completed` | preview | n/a | original |
| `declined`, `cancelled`, `expired`, `refunded`, `removed_early` | nothing | nothing | nothing |

In `post_on_page` orders the creator posts from their own copy, so the brand never gets the original. Until Phase 7, `previewKey` points to the same file as `originalKey`.

## 7. Order state machine

All status changes go through one module, `convex/orderMachine.ts` (planned, Phase 4). Each change checks the current status, the caller's role and the order type, and writes ledger entries in the same mutation. Timers are Convex scheduled functions. "Auto" means a scheduled function.

### Statuses

Main: `draft`, `awaiting_payment`, `paid_in_escrow`, `awaiting_shipment`, `shipped`, `received`, `in_progress`, `draft_submitted`, `revision_requested`, `draft_approved`, `posted`, `live_period`, `completed`, `delivered`, `approved`, `paid_out`.
Side: `declined`, `cancelled`, `expired`, `disputed`, `refunded`, `removed_early`.

### Transitions

| From | To | Who | Condition and effect |
| --- | --- | --- | --- |
| `draft` | `awaiting_payment` | brand | Brief and creator chosen |
| `draft`, `awaiting_payment` | `cancelled` | brand | No money held |
| `awaiting_payment` | `paid_in_escrow` | brand | Simulated checkout. Ledger `hold` = `price`. Sets `acceptDeadline` |
| `paid_in_escrow` | `in_progress` | creator | Accepts, product type `none` or `reimbursed`. Sets `deliveryDeadline` |
| `paid_in_escrow` | `awaiting_shipment` | creator | Accepts, product type `keep` or `return_required` |
| `paid_in_escrow` | `declined` | creator | Ledger `refund` of the full hold |
| `paid_in_escrow` | `expired` | auto | `acceptWindowHours` passed. Full refund |
| `awaiting_shipment` | `shipped` | brand | Adds courier and tracking number |
| `awaiting_shipment` | `cancelled` | brand | Before shipping. Full refund |
| `shipped` | `received` | creator | Confirms receipt |
| `received` | `in_progress` | auto | Immediately. Sets `deliveryDeadline` from receipt |
| `in_progress` | `expired` | auto | `deliveryDeadline` passed. Full refund |
| `in_progress` | `draft_submitted` | creator | `post_on_page`, `both`. Uploads draft |
| `in_progress` | `delivered` | creator | `deliver_to_brand`. Uploads video |
| `draft_submitted`, `delivered` | `revision_requested` | brand | Written feedback; `revisionsUsed < maxFreeRevisions` |
| `revision_requested` | `draft_submitted` / `delivered` | creator | New version uploaded |
| `draft_submitted`, `delivered`, `revision_requested` | `disputed` | brand | Pauses every timer on the order |
| `draft_submitted` | `draft_approved` | brand or auto | Auto after `autoApproveDays` |
| `draft_approved` | `posted` | creator | Submits post link and screenshot |
| `posted` | `live_period` | brand or auto | Confirms the post. Ledger `release` of the upfront share and `fee` of its share. Sets `liveUntil` |
| `live_period` | `completed` | brand or auto | After `stayUpDays`, creator submits an insights screenshot and the brand confirms. Ledger `release` of the rest and `fee` of the rest |
| `live_period` | `removed_early` | brand | Reports removal with a screenshot. Ledger `refund` of the remaining hold. The creator can dispute |
| `delivered` | `approved` | brand or auto | Auto after `autoApproveDays` |
| `approved` | `paid_out` | auto | Immediately. Ledger `release` of `price - platformFee` and `fee` |
| `disputed` | `refunded`, or back to the status it came from, or `paid_out` / `completed` | admin | Refund, partial refund, another revision, or release |

Auto-approve and auto-confirm send reminders on days 3 and 6. The brand always sees "Request changes" and "Open a dispute" next to the countdown.

### Money rules

- `platformFee = round(price * platformFeePercent / 100)`, fixed at checkout.
- `post_on_page` and `both`: upfront release `= floor((price - platformFee) * upfrontPercent / 100)`; the final release is the rest of `price - platformFee`. The fee is recorded in two parts in the same ratio.
- The sum of an order's `release`, `fee` and `refund` entries never exceeds its `hold`.

## 8. Payments

- **Stage A (this build): simulated escrow.** A ledger in Convex records every movement. No real money, no real keys, no payment SDKs.
- **Stage B (only if it goes real):** a local gateway such as bKash or Nagad, or an aggregator, after a legal check of the Digital Commerce Operation Guidelines 2021 with a lawyer or accountant.

## 9. Brand and creator protections

Refund rules (shown in the terms at checkout):

| Situation | Outcome |
| --- | --- |
| Creator declines, never accepts, never delivers or misses a deadline | Full refund |
| Delivered but ignores the brief | Admin decides: refund or another revision round |
| Brief followed, brand just dislikes it | Funds released to the creator |
| Post removed during the live period | Remaining held amount back to the brand |

Physical products (`productType` on the brief):

- `none` / `reimbursed`: nothing is shipped.
- `keep`: the item is part of the creator's payment and is never returned.
- `return_required`: higher-value items only. Returned only if the order is cancelled or the creator misses the deadline.
- Shipping happens only after payment and creator acceptance. The terms say the platform is not liable for lost items (needs a lawyer's check).

Proof of posting is manual: post link and screenshot at `posted`, an insights screenshot at the end of the live period, brand confirmation for each, admin spot-checks. No scraping, no Meta API. Creators get a reminder about each platform's paid-partnership labeling rules.

Creators who take items or don't deliver are suspended. Tracking numbers and order records are kept as evidence.

## 10. Open questions

- Bangla UI from the start, or English first with Bangla briefs as content?
- Mux or plain R2 playback once real videos are tested on slow connections?
- Should editing an approved creator profile send it back to review? (Currently approval is never reset.)
- `removed_early` refunds on the brand's report alone. Should it need creator agreement or admin review first?
- The directory filters in memory up to `DIRECTORY_SCAN_LIMIT`. Past that it needs a denormalized search table.
- Which payment gateway, if Stage B happens?
- Are 14 stay-up days and a 50/50 split right? Test with real brands and creators.
