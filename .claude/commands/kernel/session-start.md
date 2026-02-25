# /kernel/session-start

Check state and resume if needed. Always invoke first.

## Instructions

1. **Check for existing state:**
   - Read `.claude/state/session_state.json` if exists
   - If `context` key exists, read and internalize it — this is prior conversation context
   - Report context summary so continuity is established
   - If `needs_restart` is true, handle restart resume (see Step 2)

2. **Handle restart resume:**

   If `needs_restart` is true:

   a. Clear the restart flag:
   ```json
   {
     "needs_restart": false
   }
   ```

   b. Check `resume_step` for skill-based resume:
   - If `resume_step` is set (e.g., `2`), resume `/kernel/domain-setup` at that step
   - Read the skill SKILL.md and continue from indicated step

   c. Otherwise check `resume_after_restart`:
   - If set to "anchor" or "/kernel/anchor", invoke `/kernel/anchor`
   - If set to other command, invoke that command

3. **Check for domain state:**
   - Look for `.claude/state/[domain]_workflow.json`
   - If exists, summarize current progress

4. **Domain persistence rule (CRITICAL):**
   - **If domain exists → USE IT** (never create new)
   - One project = one domain = one protocol
   - New capabilities (API, UI, etc.) extend existing protocol via `/kernel/learn`
   - Only invoke `/kernel/domain-setup` if NO domain exists at all

5. **Update session state (MERGE, don't overwrite):**

   CRITICAL: Merge these fields into existing state. Do NOT overwrite the entire file.
   Preserve existing keys, especially `context`.

   ```json
   {
     "session_started": true,
     "timestamp": "...",
     "resumed_from": null | "previous_step"
   }
   ```

6. **Force anchor on fresh start:**

   If NOT resuming from restart (i.e., `needs_restart` was false or missing):
   - Set `anchored: false` in domain_workflow.json (if domain exists)
   - This ensures hook blocks until anchor is invoked

   ```json
   // In [domain]_workflow.json:
   {
     "anchored": false
   }
   ```

7. **Report:**
   ```
   Session started.
   - State: [fresh | resumed from X]
   - Domain: [none | domain name]
   - Prior context: [summary of context key, or "none"]
   - Next: [what to do next]

   Proceeding.
   ```

## Resume Step Support

For skill-based commands like `/kernel/domain-setup`:

| State Field | Purpose |
|-------------|---------|
| `resume_step` | Step number to resume from (e.g., `2`) |
| `resume_after_restart` | Command to invoke (e.g., `"/kernel/anchor"`) |

When `resume_step` is set:
1. Invoke the relevant skill command
2. Skip to the indicated step
3. Continue from there

## State File Location

`.claude/state/session_state.json`
