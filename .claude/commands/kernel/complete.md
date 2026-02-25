# /kernel/complete

Final gate before marking work done.

## Instructions

1. **Check state:**

   | Gate | Required |
   |------|----------|
   | Protocol created | `protocol_created: true` |
   | Anchored | `anchored: true` |

2. **Save final conversation context:**
   - Update `context` key in `.claude/state/session_state.json` with:
     - Summary of what was accomplished this session
     - Key decisions made
     - Any open items or next steps for future sessions
   - MERGE into existing state, don't overwrite other keys

3. **Update state:**
   ```json
   {
     "complete": true,
     "complete_timestamp": "..."
   }
   ```

4. **Report:**
   ```
   COMPLETE

   Domain: [domain]
   Task: [what was done]
   Files created/modified: [count]
   Lessons learned: [count]

   Done.
   ```

## When to Invoke

- ALWAYS before saying "done"
- NEVER skip this gate
