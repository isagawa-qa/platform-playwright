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

3. **Read Lessons Cheat Sheet (USE READ TOOL):**
   - Open `.claude/lessons/lessons.md`
   - Read entire file — use the Read tool, not memory
   - This is a cheat sheet of actionable directives, not descriptions

4. **Cite rules for current task (MANDATORY):**
   - After reading the cheat sheet, list 3-5 specific rules that apply to your current task
   - Format: `rule from cheat sheet` → `how it applies to this task`
   - You MUST cite actual rules from the cheat sheet — not paraphrases, not generalities
   - This appears in the anchor confirmation output under "Rules for this task"
   - If you cannot cite specific rules, you did not read the cheat sheet

5. **Restore conversation context (USE READ TOOL):**
   - Read `.claude/state/session_state.json`
   - If `context` key exists, internalize prior decisions, direction changes, and task thread
   - This recovers context that may have been lost to context window compression

### Part B: Review All Inter-Anchor Work

**CRITICAL: If `actions_since_anchor > 0` in workflow state, there IS work to review. NEVER claim "no new work" when the counter is non-zero.**

6. **Read the actions log:**
   - Read `actions_log` array from `session_state.json`
   - This is the itemized ledger of every action since the last anchor
   - Every Edit, Write, Bash, Task, and Read that modified state IS work
   - Cross-repo actions ARE work
   - State file updates ARE work

7. **Review each action against protocol:**

   | Check | Status |
   |-------|--------|
   | Naming conventions followed? | ✓/✗ |
   | Architecture patterns matched? | ✓/✗ |
   | Anti-patterns avoided? | ✓/✗ |
   | Quality gates passed? | ✓/✗ |

8. **If violation found:**
   - STOP
   - Set `needs_learn: true, needs_learn_reason: "anchor_violation"` in session_state.json
   - Fix the violation
   - Invoke `/kernel/learn` to record lesson (this clears the block)
   - Then continue

9. **Learn self-enforcement check:**
   - If test failures occurred since last anchor (check actions_log for failed Bash test commands)
     but no lesson was recorded (no `/kernel/learn` invocation in actions_log):
   - Set `needs_learn: true, needs_learn_reason: "test_failure"` in session_state.json
   - Invoke `/kernel/learn` before proceeding
   - This catches cases where the hook didn't fire (e.g., not yet restarted after setup)

### Part C: Save State and Proceed

10. **Save conversation context:**
   - Update `context` key in `.claude/state/session_state.json` with:
     - Key decisions made since last anchor
     - Direction changes or pivots
     - Current task thread and next steps
     - Any user preferences or constraints discovered
   - Keep concise — key/value pairs, not narrative
   - MERGE into existing state, don't overwrite other keys

11. **Clear and reset actions log:**
    - Clear the `actions_log` array in `session_state.json` (set to `[]`)
    - The log resets each anchor — new actions get appended as they happen

12. **State current task:**
    - What are you about to do?
    - How does it fit the protocol?

13. **Update state:**

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

14. **Confirm:**
    ```
    ANCHORED: [domain]

    Key patterns:
    - [pattern 1]
    - [pattern 2]

    Rules for this task:
    - [cheat sheet rule] → [how it applies]
    - [cheat sheet rule] → [how it applies]
    - [cheat sheet rule] → [how it applies]

    Actions reviewed: N
    Violations: 0 | N

    Current task: [what you're doing]

    Proceeding with protocol.
    ```

## Actions Log

Between anchors, append every action to `actions_log` in `session_state.json`:

```json
{
  "actions_log": [
    "Edit: filename.md — what changed",
    "Write: filename.json — what was written",
    "Bash: command — what it did",
    "Task: description — what agent explored"
  ]
}
```

This log is the source of truth for Part B review. It survives context compaction.

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
- **Work quality check** (Part B)

One command, one counter, one mechanism.
