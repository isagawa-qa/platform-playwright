# /kernel/session-start

Check state and resume if needed. Always invoke first.

## Instructions

1. **Check for existing state:**
   - Read `.claude/state/session_state.json` if exists
   - If `needs_restart` is true, resume from `resume_after_restart`

2. **Check for domain state:**
   - Look for `.claude/state/[domain]_workflow.json`
   - If exists, summarize current progress

3. **Domain persistence rule (CRITICAL):**
   - **If domain exists → USE IT** (never create new)
   - One project = one domain = one protocol
   - New capabilities (API, UI, etc.) extend existing protocol via `/kernel/learn`
   - Only invoke `/kernel/domain-setup` if NO domain exists at all

4. **Update session state:**
   ```json
   {
     "session_started": true,
     "timestamp": "...",
     "resumed_from": null | "previous_step"
   }
   ```

5. **Force anchor on fresh start:**

   If NOT resuming from restart (i.e., `needs_restart` was false or missing):
   - Set `anchored: false` in domain_workflow.json (if domain exists)
   - This ensures hook blocks until anchor is invoked

   ```json
   // In [domain]_workflow.json:
   {
     "anchored": false
   }
   ```

6. **Report and PROCEED (no asking):**
   ```
   Session started.
   - State: [fresh | resumed from X]
   - Domain: [none | domain name]
   - Next: [what happens next]

   Proceeding.
   ```

7. **Auto-proceed (MANDATORY — do NOT ask the user):**

   After reporting, IMMEDIATELY proceed to the next step:

   - **No domain exists** → Invoke `/kernel/domain-setup` NOW
   - **Domain exists** → Invoke `/kernel/anchor` NOW
   - **Resuming from restart** → Follow resume instructions (step 1)

   **NEVER ask "Would you like me to..." or "Should I...".**
   The kernel is autonomous. Report what you're doing, then do it.

## State File Location

`.claude/state/session_state.json`
