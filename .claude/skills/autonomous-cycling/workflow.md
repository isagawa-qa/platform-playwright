# Cycling Workflow

Autonomous loop through numbered tasks.

## The Loop

1. **Scan** — list all `.md` files in `tasks/`
2. **Pick** — lowest-numbered task NOT in `completed_tasks` or `skipped_tasks`
3. **Save state** — update `[domain]_workflow.json`:
   - `cycling: true`, `current_task`, `attempts_on_current: 0`
   - Update `context` in `session_state.json`: "Starting task NNN"
4. **Implement** — follow task's requirements and acceptance criteria
5. **Verify** — check EVERY acceptance criterion mechanically (see below)
   - If ANY criterion fails → fix → `/kernel/learn` → re-verify
6. **Complete** — invoke `/kernel/complete` via the Skill tool (NOT by printing the format).
   The complete command is a gate — it checks state, updates cycling, commits.
   Printing "COMPLETE" without invoking the skill is a protocol violation.
7. **Loop** — go to step 1 (`/kernel/complete` handles the commit)

## Verification

Each task's acceptance criteria define "done". Verify each criterion mechanically:

| Criterion Type | How to Verify |
|----------------|---------------|
| File exists | Glob to confirm path |
| Code compiles | `npx tsc --noEmit` or equivalent |
| Uses pattern X | Grep the file for the pattern |
| Pattern absent | Grep to confirm absence |
| Method signature | Read the file and verify |

If a criterion can't be verified mechanically, state what you checked and why you believe it's met.

## State Tracking

Fields in `[domain]_workflow.json`:

| Field | Type | Purpose |
|-------|------|---------|
| `cycling` | bool | Whether in cycling mode |
| `current_task` | string | Task currently being worked on |
| `completed_tasks` | array | Completed task filenames |
| `skipped_tasks` | array | Tasks skipped due to stagnation |
| `total_tasks` | number | Count of all tasks |
| `attempts_on_current` | number | Retry counter for current task |

## State Update Schedule

| Event | What's Written |
|-------|----------------|
| Start cycling | `cycling: true`, `total_tasks: N` |
| Pick task | `current_task`, progress note in context |
| `/kernel/complete` | `completed_tasks` updated, summary in context |
| Anchor (every 10) | Current decisions in context |
| Stagnation skip | `skipped_tasks` updated |
| All done | `cycling: false` |

## Error Handling

- **Test failure** → fix → `/kernel/learn` → retry
- **Stuck** (`attempts_on_current >= 3`) → record lesson, add to `skipped_tasks`, advance
- **All tasks done** (including skipped) → report summary, set `cycling: false`

## Resume After Compaction or Restart

State files survive context compaction and session restarts:

1. `session-start` reads workflow state → sees `cycling: true`
2. Anchor reads `context` key → knows current task and progress
3. Agent re-reads current task's acceptance criteria
4. Checks each criterion against filesystem (idempotent)
5. Skips already-met criteria, implements what's missing

## Git After Each Task

- `git add` the specific files created/modified for the task
- Commit message: `feat: implement [task-name] (task NNN)`
- Push to current branch
