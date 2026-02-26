# /kernel/anchor

Re-center on protocol. Invoke at session start, every 10 actions, or when context drifts.

## Instructions

### Part A: Refresh Protocol

**MANDATORY: Use the Read tool on EVERY file listed below. EVERY TIME. No exceptions.**

**Do NOT say "already read this session" or "quick anchor." The entire point of anchoring is to RE-READ. If you skip reading, you are defeating the anchor mechanism.**

1. **Read protocol (USE READ TOOL):**
   - Open `.claude/protocols/[domain]-protocol.md`
   - Read entire file — use the Read tool, not memory

2. **Summarize key points:**
   - Architecture patterns
   - Naming conventions
   - Quality gates
   - Anti-patterns to avoid

3. **Read Lessons Learned (USE READ TOOL):**
   - Open `.claude/lessons/lessons.md`
   - Read entire file — use the Read tool, not memory
   - Note any recent additions
   - These are mistakes to avoid

4. **Restore conversation context (USE READ TOOL):**
   - Read `.claude/state/session_state.json`
   - If `context` key exists, internalize prior decisions, direction changes, and task thread
   - This recovers context that may have been lost to context window compression

### Part B: Check Recent Work (if any)

5. **Review recent work:**
   - What files were created/modified since last anchor?
   - If none, skip to Step 8

6. **Check against protocol:**

   | Check | Status |
   |-------|--------|
   | Naming conventions followed? | ✓/✗ |
   | Architecture patterns matched? | ✓/✗ |
   | Anti-patterns avoided? | ✓/✗ |
   | Quality gates passed? | ✓/✗ |

7. **If violation found:**
   - STOP
   - Set `needs_learn: true, needs_learn_reason: "anchor_violation"` in session_state.json
   - Fix the violation
   - Invoke `/kernel/learn` to record lesson (this clears the block)
   - Then continue

### Part C: Reset and Proceed

8. **Save conversation context:**
   - Update `context` key in `.claude/state/session_state.json` with:
     - Key decisions made since last anchor
     - Direction changes or pivots
     - Current task thread and next steps
     - Any user preferences or constraints discovered
   - Keep concise — key/value pairs, not narrative
   - MERGE into existing state, don't overwrite other keys

9. **State current task:**
   - What are you about to do?
   - How does it fit the protocol?

10. **Update state:**

   Update `.claude/state/[domain]_workflow.json`:
   ```json
   {
     "anchored": true,
     "anchor_timestamp": "...",
     "actions_since_anchor": 0
   }
   ```

   If resuming from restart, also update `.claude/state/session_state.json`:
   ```json
   {
     "needs_restart": false,
     "resume_after_restart": null
   }
   ```

11. **Confirm:**
   ```
   ANCHORED: [domain]

   Key patterns:
   - [pattern 1]
   - [pattern 2]

   Lessons to remember:
   - [lesson 1]
   - [lesson 2]

   Files checked: N (0 if fresh session)
   Violations: 0 | N

   Current task: [what you're doing]

   Proceeding with protocol.
   ```

## State File Location

`.claude/state/[domain]_workflow.json`

## When to Invoke

- After `/kernel/session-start` (mandatory - hook enforced)
- Every 10 actions (Write, Edit, Bash) - hook enforced
- After any failure (before fixing)
- When resuming from break
- When context seems off

## Unified Re-centering

This command combines:
- **Protocol refresh** (Part A)
- **Work quality check** (Part B - from old validate)

One command, one counter, one mechanism.
