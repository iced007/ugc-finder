# Task spec template

One section per task, in `docs/tasks/phase-N.md`. Keep each spec under about 25 lines. If a spec is longer, the task is too big and should be split.

```
## N.M Task title

**Goal:** one sentence on what exists when this is done.

**Build:**
- concrete item
- concrete item

**Files:** files or folders to create or edit (and nothing else)

**Data:** tables or fields involved, with a pointer to docs/tech-stack.md if defined there

**Allowed new dependencies:** none, or a named list

**Acceptance (how to check it):**
- observable behavior, e.g. "page renders at 360px with no horizontal scroll"
- `npx tsc --noEmit` and lint pass

**Out of scope:** things Codex might be tempted to add
```
