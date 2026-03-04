# /kernel/complete

Final gate before marking work done.

## Instructions

1. **Check state:**

   | Gate | Required |
   |------|----------|
   | Protocol created | `protocol_created: true` |
   | Anchored | `anchored: true` |

2. **Update state:**
   ```json
   {
     "complete": true,
     "complete_timestamp": "..."
   }
   ```

3. **Report:**
   ```
   COMPLETE

   Domain: [domain]
   Task: [what was done]
   Files created/modified: [count]
   Lessons learned: [count]

   Done.
   ```

4. **Git commit:**
   - `git add` the specific files created/modified for the task
   - Commit message: `feat: implement [task-name]`

5. **Cycling continuation:**

   Read `[domain]_workflow.json`.

   If `cycling: true`:
   - Add current_task to `completed_tasks`
   - Reset `attempts_on_current` to 0
   - Scan `tasks/` for next incomplete task (lowest-numbered not in completed_tasks or skipped_tasks)

   **Dual state update (BOTH files MUST be updated):**

   Update `[domain]_workflow.json`:
   - `completed_tasks`: add current task
   - `current_task`: next task (or null if done)
   - `attempts_on_current`: 0

   Update `session_state.json` context:
   - Completion summary for the task just finished
   - Next task name and what it requires
   - Current cycling progress (e.g., "4/7 tasks complete")

   Both files MUST be updated. Workflow tracks cycling state. Session tracks context for compaction recovery.

   - If next task found: announce it, continue working
   - If none remain: announce "All N tasks complete (M skipped)", set `cycling: false`

## When to Invoke

- ALWAYS before saying "done"
- NEVER skip this gate
