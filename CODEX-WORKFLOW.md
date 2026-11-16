# Working with Codex without burning your limit

## Setup (once)
1. Create the repo. Put `AGENTS.md` in the repo root.
2. Put these in `/docs`: `mission.md`, `tech-stack.md`, `roadmap.md`, `STATUS.md`.
3. Put the task specs in `/docs/tasks`: `phase-0.md` now, and each next phase's file when I write it. `task-template.md` goes there too.
4. Make sure `.gitignore` covers `node_modules`, `.next`, `.env*` (except `.env.example`) and build output.

`AGENTS.md` is loaded into every session, so it stays short. Everything else is read only when a task needs it.

## How a task runs
1. Open a fresh Codex session.
2. Paste this, changing the number:
```
Do task 0.3. Read the spec for it in docs/tasks/phase-0.md and only that section. Follow AGENTS.md. Update docs/STATUS.md when done.
```
3. Codex builds, checks, ticks STATUS.md and replies in about 8 lines.
4. You check the result in the browser. If something is wrong, paste me the error or the problem and I'll write a one-line fix instruction.

## Habits that save the most usage
1. One task per session, and a fresh session for the next one. Long sessions keep paying for old history.
2. Never ask for "the whole phase" or "the whole page". Use task numbers.
3. Don't paste docs into the prompt. The spec and AGENTS.md already point to them.
4. If a task needs a split, accept the split.
5. Review with me, not with Codex. Paste me the summary or the error instead of asking Codex to re-read the repo.
6. Near your limit, tell Codex: "Update docs/STATUS.md with where you stopped, then end." The next session continues from there.

## Before each new phase
Paste me the finished phase's STATUS.md section and Codex's last summaries. I'll check them against the docs and write the next phase's task specs, based on what was really built.

## If a task has no spec
Don't start it. Ask me for the spec first.
