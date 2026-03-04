# /kernel/autonomous-cycle

Start autonomous cycling through tasks. User-invoked entry point.

## Instructions

1. **Check gates:**

   | Gate | Required |
   |------|----------|
   | Protocol created | `protocol_created: true` |
   | Anchored | `anchored: true` |
   | Tasks exist | `tasks/` has `.md` files |

2. **Scan tasks:**
   - List all `.md` files in `tasks/`
   - Exclude files in `completed_tasks` and `skipped_tasks`
   - If no remaining tasks: report "No tasks to cycle through" and STOP

3. **Initialize cycling state:**
   Update `[domain]_workflow.json` (MERGE, don't overwrite):
   ```json
   {
     "cycling": true,
     "total_tasks": N,
     "current_task": "[lowest-numbered remaining]",
     "attempts_on_current": 0
   }
   ```
   Preserve existing `completed_tasks` and `skipped_tasks` (for resume).

4. **Update session context:**
   Update `session_state.json` context:
   ```json
   {
     "status": "Cycling started — N tasks remaining",
     "current_task": "Implement [first task name]",
     "cycling": true
   }
   ```

5. **Report:**
   ```
   CYCLING STARTED

   Total tasks: N
   Already completed: M
   Remaining: K
   First task: [name]

   Starting implementation.
   ```

6. **Begin work:**
   - Read the first task
   - Start implementing
   - `/kernel/complete` handles cycling continuation from here

## When to Invoke

- User says "cycle", "start cycling", "run tasks", or similar
- After domain-setup + anchor when tasks exist
- NEVER invoke automatically — this is user-triggered
