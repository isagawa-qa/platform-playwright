# /kernel/learn

Update protocol AND hooks after fixing any failure. Make the same mistake impossible.

## Instructions

1. **Identify what failed:**
   - Error message
   - Root cause
   - How it was fixed

2. **Record lesson:**

   Open `.claude/lessons/lessons.md` and append:

   ```markdown
   ## [Date] [Issue Name]
   - **Issue:** What happened
   - **Root Cause:** Why it happened
   - **Fix:** How it was resolved
   - **Anti-Pattern Added:** What to avoid (if applicable)
   - **Quality Gate Added:** What to check (if applicable)
   ```

3. **Update reference files:**

   If the lesson reveals a pattern worth codifying:

   a. **Read the protocol index** (`.claude/protocols/[domain]-protocol.md`) to discover what reference files exist
   b. **Check for domain pack** — look for `.claude/skills/*-domain-pack/` or domain pack references in the protocol index
   c. **Follow the appropriate path:**

   **Domain pack present** — the pack defines the reference structure. Follow it:
   - Match the lesson to the pack's reference files (anti-patterns, quality gates, etc.)
   - Write directly — domain pack mappings are pre-approved by the pack author
   - Stay consistent with the pack's existing format and conventions

   **No domain pack** — generic/vanilla kernel. Discover dynamically:
   - Determine which reference file the lesson applies to (if any)
   - Propose the update to the user — state which file, what you'd add, and why
   - Only write after user approves
   - If no existing reference file fits, propose a new one

   The human is the source of truth. Domain packs encode pre-approved human expertise.

4. **Update hooks if enforceable:**

   If this failure could be automatically prevented:

   ```python
   # Add to PROTECTED_PATHS in [domain]-gate-enforcer.py
   PROTECTED_PATHS['new/path/'] = 'new_state_key'
   ```

5. **Create new command if recurring:**

   If this is a pattern that needs checking:
   - Create `.claude/commands/[domain]-check-[issue].md`

6. **Update state:**

   Update `.claude/state/session_state.json`:
   ```json
   {
     "needs_learn": false,
     "needs_learn_reason": null
   }
   ```

   Update `.claude/state/[domain]_workflow.json`:
   ```json
   {
     "lesson_recorded": true,
     "lessons_count": N,
     "last_lesson": "Issue name",
     "last_lesson_timestamp": "...",
     "hooks_updated": true | false
   }
   ```

7. **Report:**
   ```
   LESSON RECORDED

   Issue: [what failed]
   Root Cause: [why]
   Fix: [how resolved]

   Lesson file updated: .claude/lessons/lessons.md
   Reference files updated:
   - [file]: [what was added]

   Hooks updated: [yes/no]
   - [what was added if yes]

   New command created: [yes/no]
   - [command name if yes]

   Proceeding.
   ```

## State File Location

`.claude/state/[domain]_workflow.json`

## When to Invoke

- After fixing any test failure
- After fixing any error
- After discovering an anti-pattern
- NEVER skip this after a fix
