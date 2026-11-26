# Task spec template

One section per task in `docs/v2/tasks/phase-N.md`. Copy the block below.

## Rules for writing a spec

- Keep a spec under about 25 lines. Longer means the task is too big: split it.
- One task touches about 8 files or 300 lines at most, including `docs/v2/STATUS.md`.
- Name exact files. The agent may edit only what **Files** lists.
- Point **Reads** at sections, not whole files ("tech-stack.md, section 6"). Never list `node_modules`, `convex/_generated` or lockfiles.
- Put every number in `convex/lib/config.ts` and name it here. Never write a raw limit into **Build**.
- Write **Acceptance** as things a person can see or run. Each line must be checkable.
- If the task needs an account, a secret or a new dependency, say so under **Manual steps** or **Allowed new dependencies**. Agents stop for anything not listed.
- A spec that changes an earlier decision says so in one line under **Build** ("This replaces ... in task 1.4").

## Template

```
## N.M Task title

**Goal:** one sentence on what exists when this is done.

**Reads:** doc sections and existing files the agent needs, nothing else.

**Build:**
- concrete item
- concrete item

**Files:** every file to create or edit, and `docs/v2/STATUS.md`

**Data:** tables or fields touched, with a pointer to tech-stack.md section 5. "none" if none.

**Config:** names from convex/lib/config.ts used or added. "none" if none.

**Allowed new dependencies:** none, or a named list

**Manual steps:** what the user does by hand (accounts, env vars, dashboard clicks). "none" if none.

**Stop and ask if:** conditions specific to this task, on top of AGENTS.md

**Acceptance:**
- observable behavior
- usable at 360px with no horizontal scroll; tap targets at least 44px (UI tasks)
- `npm run typecheck` and `npm run lint` pass

**STATUS line:** `N.M Task title — one-line note of what was built`

**Out of scope:** things the agent might be tempted to add
```

## Example

```
## 1.5 Brand profile form

**Goal:** a brand can save and reopen its business profile.

**Reads:** tech-stack.md sections 3 and 5 (brandProfiles), convex/lib/roles.ts, convex/lib/validation.ts. Use components/creator/CreatorProfileForm.tsx only as a model for layout.

**Build:**
- convex/brandProfiles.ts: getMine (null for wrong role) and upsertMine (requireRole brand). businessName 2 to 80 characters, https page link, category in CATEGORIES.
- lib/validation/brandProfile.ts: Zod schema. components/brand/BrandProfileForm.tsx and app/brand/profile/page.tsx: load, save, inline errors, success message.

**Files:** convex/schema.ts, convex/brandProfiles.ts, lib/validation/brandProfile.ts, components/brand/BrandProfileForm.tsx, app/brand/profile/page.tsx, docs/v2/STATUS.md

**Data:** brandProfiles (new), index by_user
**Config:** none
**Allowed new dependencies:** none
**Manual steps:** keep `npx convex dev` running to push the schema
**Stop and ask if:** the schema needs a field not in tech-stack.md section 5

**Acceptance:**
- Save, reload, values persist. A non-https link shows an error.
- upsertMine called as a creator is rejected.
- Usable at 360px; `npm run typecheck` and `npm run lint` pass.

**STATUS line:** `1.5 Brand profile form — brandProfiles table, role-checked getMine/upsertMine, saved form`

**Out of scope:** logo upload, verifying the Facebook page.
```
