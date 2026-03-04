# Autonomous Cycling — Domain Spec

**Type:** Prescriptive (Template 1)
**Style:** Minimal — SKILL.md + workflow.md

## What

Teaches the agent to autonomously loop through numbered tasks in `tasks/`. The agent picks the highest-priority incomplete task, implements it fully, verifies acceptance criteria, completes it, commits, and advances to the next.

## Philosophy

- **Don't stop** — after completing one task, immediately pick the next
- **Verify mechanically** — check every acceptance criterion against the filesystem
- **Persist state** — survive context compaction and session restarts
- **Skip when stuck** — 3 failed attempts → record lesson, skip, continue

## Key Files

| File | Purpose |
|------|---------|
| `SKILL.md` | This file — identity, philosophy, index |
| `workflow.md` | The loop behavior, state tracking, verification, error handling |

## Integration

- **Kernel provides:** hooks, anchor, learn, complete gates
- **This spec provides:** cycling behavior (pick → implement → verify → advance)
- **Domain-setup builds:** protocol referencing this workflow + roadmap in `tasks/`

## When Active

Cycling is active when `[domain]_workflow.json` contains `"cycling": true`. The agent enters cycling mode when told to "cycle through tasks" or when session-start detects `cycling: true` in workflow state.
