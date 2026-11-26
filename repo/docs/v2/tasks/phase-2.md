# Phase 2 task specs: Creator directory and samples

Goal of the phase: brands can browse approved creators and watch their sample videos. See [roadmap](../roadmap.md#phase-2-creator-directory-and-samples-l).

Assumes Phase 1 is done: `users.role`, `convex/lib/roles.ts`, `creatorProfiles` with `approvedByAdmin`, `components/dashboard/DashboardShell.tsx`, and `getMine` returning null for the wrong role.

Decisions behind this phase:

- **One R2 library.** `aws4fetch` signs requests with Web Crypto, so it runs in the default Convex runtime (no `"use node"`) and is far smaller than the AWS SDK. It is the only new dependency in this phase.
- **Samples only.** Order videos and order-status checks arrive in Phase 5. Phase 2 access rules are the "Samples" table in tech-stack.md, section 6.
- **No transcoding.** Samples stream as uploaded, with no download button. Lower-quality public copies are Phase 7.
- **Approval comes before public pages,** so every public query filters on `approvedByAdmin` from the start. Task 2.5 replaces the old Phase 6 "Creator approval" item.
- **Public pages are open to signed-out visitors.** `/creators` is not in `proxy.ts`'s protected paths (only `/creator` and its sub-paths are), so no proxy change is needed.

Do the tasks in order, one per session.

## 2.1 R2 bucket, config module and signing helper

**Goal:** Convex can sign R2 requests, and every Phase 2 limit lives in one config file.

**Reads:** tech-stack.md sections 4 and 6, `.env.example`, https://developers.cloudflare.com/r2/api/s3/presigned-urls/

**Build:**
- Install `aws4fetch`.
- `convex/lib/config.ts`: plain TypeScript, no Convex imports. Add the Phase 2 rows of tech-stack.md section 4, as named there.
- `convex/lib/r2.ts`: `presignPut(key, contentType, sizeBytes)`, `presignGet(key)`, `deleteObject(key)` and `headObject(key)`. Read the four `R2_*` env vars and throw "R2 is not configured: missing R2_X" if any is empty. Expiry from config.
- `convex/r2Check.ts`: internal action `ping` that calls `headObject("healthcheck")` and returns `{ ok: true }` for 200 or 404, else the status.
- `.env.example`: list the four `R2_*` names, empty, under a comment saying they are set with `npx convex env set`, not in `.env.local`.

**Files:** package.json, convex/lib/config.ts, convex/lib/r2.ts, convex/r2Check.ts, .env.example, docs/v2/STATUS.md
**Data:** none
**Config:** adds `SAMPLE_MAX_BYTES`, `SAMPLE_MAX_SECONDS`, `SAMPLE_CONTENT_TYPES`, `MAX_SAMPLES_PER_CREATOR`, `UPLOAD_URL_TTL_SECONDS`, `PLAYBACK_URL_TTL_SECONDS`, `DIRECTORY_PAGE_SIZE`, `DIRECTORY_SCAN_LIMIT`
**Allowed new dependencies:** `aws4fetch`
**Manual steps:** create a private R2 bucket; add a CORS rule allowing `PUT` and `GET` from `http://localhost:3000` and the Netlify URL with header `content-type`; create an R2 API token for that bucket only; run `npx convex env set` for `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. The agent never sees or types the values.
**Stop and ask if:** the bucket needs a public URL, or any step needs a secret in the repo.

**Acceptance:**
- `npx convex run r2Check:ping` returns `{ ok: true }`. With one env var unset it returns the readable "missing" error.
- `npm run typecheck` and `npm run lint` pass.

**STATUS line:** `2.1 R2 bucket, config module and signing helper — aws4fetch signer, convex/lib/config.ts, R2 env vars documented`
**Out of scope:** tables, upload UI, moving the Phase 1 constants (known issue K.4).

## 2.2 Sample upload backend

**Goal:** a creator can get an upload URL, confirm the upload, list and delete their own samples.

**Reads:** tech-stack.md sections 3, 5 (`sampleVideos`) and 6; convex/lib/roles.ts, convex/lib/r2.ts, convex/lib/config.ts

**Build:**
- `convex/schema.ts`: `sampleVideos` table and `by_creator` index as in section 5.
- `convex/samples.ts`: `listMine` query (null for wrong role); internal query `countForCreator`; internal mutations `insertPending`, `markReady`, `remove`.
- `convex/sampleActions.ts`: `createUploadUrl({ contentType, sizeBytes, durationSeconds })` checks the caller is a creator, the type, size, duration and `MAX_SAMPLES_PER_CREATOR`, builds the key `samples/<userId>/<uuid>.<ext>`, inserts a `pending` row and returns `{ sampleId, uploadUrl }`. `confirmUpload({ sampleId })` checks ownership, calls `headObject`, and marks `ready` only if the object exists with the declared size. `deleteSample({ sampleId })` checks ownership, deletes the object, then the row.
- Every argument uses Convex validators. Every error message is readable.

**Files:** convex/schema.ts, convex/samples.ts, convex/sampleActions.ts, docs/v2/STATUS.md
**Data:** `sampleVideos` (new)
**Config:** `SAMPLE_*`, `MAX_SAMPLES_PER_CREATOR`, `UPLOAD_URL_TTL_SECONDS`
**Allowed new dependencies:** none
**Manual steps:** keep `npx convex dev` running.

**Acceptance:**
- Through the Convex dashboard: a creator gets an upload URL, a `curl -X PUT` with the file and content type succeeds, and `confirmUpload` marks the row `ready`.
- A brand calling `createUploadUrl` is rejected. A 200 MB size or `video/webm` type is rejected before any URL is made. A seventh sample is rejected.
- `confirmUpload` on a key never uploaded stays `pending` and returns an error. `deleteSample` removes both the object and the row.
- `npm run typecheck` and `npm run lint` pass.

**STATUS line:** `2.2 Sample upload backend — sampleVideos table, presigned upload, confirm and delete with ownership checks`
**Out of scope:** playback URLs (2.3), UI (2.4), cleaning up `pending` rows that never finish (note it in known-issues.md).

## 2.3 Signed playback for samples

**Goal:** a sample can be streamed by exactly the people the Samples table in tech-stack.md section 6 allows.

**Reads:** tech-stack.md section 6, convex/samples.ts, convex/lib/r2.ts, convex/lib/roles.ts

**Build:**
- `convex/samples.ts`: internal query `getForPlayback(sampleId)` returning the sample, its creator's `approvedByAdmin` and the caller's `{ userId, role }` (or null).
- `convex/sampleActions.ts`: `getPlaybackUrl({ sampleId })`. Owner or admin: any status. Anyone else, signed in or not: only `ready` samples of an approved creator. Otherwise throw "This video is not available." Returns `{ url, expiresAt }` from `presignGet`.
- `components/video/SignedVideo.tsx`: client component that takes a `sampleId`, calls the action, renders `<video controls playsInline preload="metadata" controlsList="nodownload">`, and asks for a fresh URL once if playback errors (the URL expired).

**Files:** convex/samples.ts, convex/sampleActions.ts, components/video/SignedVideo.tsx, docs/v2/STATUS.md
**Data:** reads `sampleVideos`, `creatorProfiles`
**Config:** `PLAYBACK_URL_TTL_SECONDS`
**Allowed new dependencies:** none
**Stop and ask if:** anything seems to need a public bucket URL.

**Acceptance:**
- Owner gets a working URL for a `pending` or `ready` sample. A signed-out caller gets one only if the creator is approved.
- After `PLAYBACK_URL_TTL_SECONDS`, the old URL returns 403 from R2.
- `npm run typecheck` and `npm run lint` pass.

**STATUS line:** `2.3 Signed playback for samples — role-checked short-lived URLs and a SignedVideo player`
**Out of scope:** order videos, thumbnails, watermarking.

## 2.4 Sample upload UI

**Goal:** a creator can upload, watch and delete samples from their dashboard, with a progress bar.

**Reads:** components/dashboard/DashboardShell.tsx, components/video/SignedVideo.tsx, convex/sampleActions.ts, convex/lib/config.ts

**Build:**
- `components/dashboard/DashboardShell.tsx`: add a "Samples" nav link to `/creator/samples` for creators only.
- `app/creator/samples/page.tsx`: role check like `app/creator/page.tsx`, inside the shell.
- `components/creator/SampleUploader.tsx`: file picker (`accept` from `SAMPLE_CONTENT_TYPES`). Before asking for a URL, check type and size and read the duration from a hidden `<video>` `loadedmetadata`. Upload with `XMLHttpRequest` PUT to show percent progress, then call `confirmUpload`. Show a plain message on every failure and a hint to compress large files.
- `components/creator/SampleList.tsx`: `listMine` as cards with `SignedVideo`, a "Processing" badge for `pending`, and a delete button with an inline "Are you sure?" step (no browser `confirm()`). Show "n of `MAX_SAMPLES_PER_CREATOR`" and hide the uploader at the limit.

**Files:** components/dashboard/DashboardShell.tsx, app/creator/samples/page.tsx, components/creator/SampleUploader.tsx, components/creator/SampleList.tsx, docs/v2/STATUS.md
**Data:** `sampleVideos`
**Config:** `SAMPLE_*`, `MAX_SAMPLES_PER_CREATOR`
**Allowed new dependencies:** none

**Acceptance:**
- Upload a 20 MB mp4: the progress bar moves, the card appears and plays.
- A 2-minute or 150 MB file is refused in the browser with a readable message and no request is made.
- Delete removes the card. A brand opening `/creator/samples` is redirected.
- Usable at 360px; tap targets at least 44px; `npm run typecheck` and `npm run lint` pass.

**STATUS line:** `2.4 Sample upload UI — uploader with progress and limits, sample list with playback and delete`
**Out of scope:** reordering, trimming, compression in the browser, thumbnails.

## 2.5 Admin creator approval

**Goal:** an admin can see creators waiting for review, watch their samples, and approve or unapprove them.

**Reads:** tech-stack.md sections 3 and 5, convex/lib/roles.ts, app/admin/page.tsx, components/video/SignedVideo.tsx

**Build:**
- `convex/schema.ts`: add index `by_approved` on `creatorProfiles.approvedByAdmin`.
- `convex/admin.ts`: `listCreators({ approved: boolean })` query (null unless admin), returning profile fields and the creator's ready sample IDs. `setCreatorApproval({ profileId, approved })` mutation with `requireRole(ctx, ["admin"])`.
- `components/admin/CreatorReviewList.tsx`: tabs "Waiting" and "Approved"; each card shows name, categories, price, social links (open in a new tab), samples with `SignedVideo`, and an Approve or Unapprove button with a pending state.
- `app/admin/page.tsx`: keep the role check and sign-out; render the list under the heading.

**Files:** convex/schema.ts, convex/admin.ts, components/admin/CreatorReviewList.tsx, app/admin/page.tsx, docs/v2/STATUS.md
**Data:** `creatorProfiles.approvedByAdmin`, new index `by_approved`
**Config:** none
**Allowed new dependencies:** none
**Manual steps:** set your own user's role to `admin` in the Convex dashboard.

**Acceptance:**
- A new creator appears under "Waiting"; Approve moves them to "Approved", and their dashboard shows "Approved".
- A creator or brand calling `setCreatorApproval` is rejected.
- `npm run typecheck` and `npm run lint` pass.

**STATUS line:** `2.5 Admin creator approval — admin review list with samples, approve and unapprove`
**Out of scope:** rejection reasons, notifications, an admin shell or nav (Phase 6).

## 2.6 Public creator profile page

**Goal:** anyone can open `/creators/<profileId>` for an approved creator and see their details and samples.

**Reads:** tech-stack.md sections 3 (public query rule) and 6, convex/creatorProfiles.ts, components/video/SignedVideo.tsx, components/landing/Header.tsx

**Build:**
- `convex/creators.ts`: `getPublic({ profileId })`, doc comment starting `Public:`. Returns null unless approved. Returns `displayName`, `bio`, `categories`, `pricePerVideo`, `socialAccounts` and ready sample IDs only; never `userId` or keys.
- `app/creators/[profileId]/page.tsx`: server component using `fetchQuery` (no token needed). `notFound()` for null or a malformed ID. Uses the landing `Header`. Shows the details, price formatted as integer taka with thousands separators, social accounts with followers and average views, samples in a grid with `SignedVideo`, and a disabled "Hire this creator" button labeled "Coming soon".
- `generateMetadata`: title "`displayName` on `APP_NAME`".

**Files:** convex/creators.ts, app/creators/[profileId]/page.tsx, docs/v2/STATUS.md
**Data:** reads `creatorProfiles`, `sampleVideos`
**Config:** none
**Allowed new dependencies:** none

**Acceptance:**
- Signed out, an approved creator's page renders and samples play. An unapproved creator's ID gives the 404 page.
- The network response of `getPublic` contains no `userId` and no R2 key.
- Usable at 360px; `npm run typecheck` and `npm run lint` pass.

**STATUS line:** `2.6 Public creator profile page — approved-only public query and /creators/[profileId]`
**Out of scope:** the hire flow (Phase 3), ratings (Phase 7), share buttons.

## 2.7 Creator directory with filters and search

**Goal:** anyone can browse approved creators at `/creators`, filter them, search by name, and open a profile.

**Reads:** tech-stack.md sections 4 and 10 (directory scan limit), convex/creators.ts, convex/lib/validation.ts, components/dashboard/DashboardShell.tsx

**Build:**
- `convex/schema.ts`: search index `search_name` on `creatorProfiles.displayName` with filter field `approvedByAdmin`.
- `convex/creators.ts`: `listPublic({ search?, category?, platform?, minPrice?, maxPrice?, minFollowers?, page })`, `Public:` comment. With `search`, use the search index; without, the `by_approved` index. Read at most `DIRECTORY_SCAN_LIMIT`, filter in the handler (followers = the largest `followerCount` across accounts), return `DIRECTORY_PAGE_SIZE` results for `page` plus `hasMore`. Same public fields as `getPublic`, without sample IDs.
- `app/creators/page.tsx` and `components/directory/DirectoryFilters.tsx`: filters and search kept in the URL query string so a filtered list can be shared; changes debounced 300 ms. Cards show name, categories, price and top platform with followers, linking to the profile. Empty state: "No creators match these filters" with a reset link. "Load more" button when `hasMore`.
- `components/dashboard/DashboardShell.tsx`: add "Find creators" (`/creators`) to the brand nav.

**Files:** convex/schema.ts, convex/creators.ts, app/creators/page.tsx, components/directory/DirectoryFilters.tsx, components/dashboard/DashboardShell.tsx, docs/v2/STATUS.md
**Data:** reads `creatorProfiles`; new search index
**Config:** `DIRECTORY_PAGE_SIZE`, `DIRECTORY_SCAN_LIMIT`; price filter bounds from `PRICE_MIN_TAKA` and `PRICE_MAX_TAKA` (still in convex/lib/validation.ts, see K.4)
**Allowed new dependencies:** none

**Acceptance:**
- With three approved creators: category, platform, price and follower filters each narrow the list; search by part of a name finds the creator; unapproved creators never appear.
- Reloading a filtered URL shows the same results.
- Usable at 360px with filters collapsible; `npm run typecheck` and `npm run lint` pass.

**STATUS line:** `2.7 Creator directory — /creators with URL-based filters, search and load more`
**Out of scope:** sorting options, saved searches, sample thumbnails on cards, a denormalized search table.
