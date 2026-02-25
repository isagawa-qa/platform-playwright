---
description: Start 5-step QA test generation workflow (Development mode — full access with approval)
---

# QA Test Generation Workflow (Development)

You are starting the 5-step QA test generation workflow in **DEVELOPMENT** mode with collaborative construction.

## Kernel Loop Integration

1. **Anchor first:** Invoke `/kernel/anchor` before executing workflow
2. **On failure:** Invoke `/kernel/fix` then `/kernel/learn` after any fix
3. **On completion:** Invoke `/kernel/complete` when workflow finishes

## Instructions

**MANDATORY: Read step files EVERY TIME this command is invoked.**

1. **Read ALL of these files NOW (use Read tool — NO EXCEPTIONS, NO SKIPPING):**
   ```
   .claude/skills/qa-management-layer/SKILL.md
   .claude/skills/qa-management-layer/steps/step-01.md
   .claude/skills/qa-management-layer/steps/step-04.md
   .claude/skills/qa-management-layer/checkpoints/pre-construction.md
   .claude/lessons/lessons.md
   ```

   **DO NOT skip because "already read this session".**
   **DO NOT rely on memory from previous workflows.**
   **READ THEM EVERY TIME.**

   **After reading all 5 files, confirm:** "All 5 protocol files read (including lessons)."

2. **THEN prompt user for requirement:**

   Ask the user:
   ```
   What test do you want to generate?

   Please provide:
   - Persona — e.g., "guest", "registered user", "admin"
   - Target URL — e.g., "https://example.com/login"
   - What you want to do — e.g., "login with valid credentials"
   - Workflow identifier — creates folders at framework/pages/{workflow}/ and tests/{workflow}/

   Format: "As a [persona], I want to [action] on [URL]"

   Example: "As a sales representative, I want to submit a service inquiry on https://example.com/inquiries"
   ```

3. **Execute the 5-step workflow:**
   - Step 1: User Input + Cross-workflow duplicate check (see step-01.md Section J)
   - Step 2: Pre-flight Configuration
   - Step 3: AI Processing
   - Step 4: Discovery + Construction (includes /qa-pre-construction checkpoint)
   - Step 5: Test Execution

---

## Development Mode Permissions

**You are in DEVELOPMENT mode. Full access granted WITH USER APPROVAL.**

### You CAN modify (with user approval):
- `tests/` — Test files
- `framework/` — All framework code (pages, tasks, roles, interfaces)
- `.claude/skills/` — Skill files
- `.claude/commands/` — Command files
- `CLAUDE.md` — Configuration files

### CRITICAL: Approval Required for ALL Changes

**Before modifying ANY file, you MUST:**
1. Show the user what you intend to change (file path, summary of change)
2. Wait for explicit approval ("yes", "ok", "approved", "do it", etc.)
3. Only then make the change

**Never auto-commit, auto-fix, or auto-modify without user consent.**

### On Failure Behavior:

If a quality gate fails or tool produces an error:

1. **STOP** — Pause workflow
2. **ANALYZE** — Identify root cause (tool bug, gate bug, AI behavior, etc.)
3. **DISCUSS** — Report to user with options:
   ```
   Issue detected at Step [X].

   Error: [error message]
   Root cause: [analysis]

   Options:
   1. Fix the tool/gate code and retry (requires approval)
   2. I will fix manually — continue workflow
   3. Log defect and abort
   ```
4. **WAIT FOR APPROVAL** — Do not proceed until user chooses an option
5. **FIX** — Only if user approves option 1, fix the framework code
6. **LOG DEFECT** — Add entry to `docs/DEFECT_LOG.md` using standard format
7. **RESTART** — After fix, restart from Step 1 to verify clean run

---

Do NOT proceed to Step 2 until user provides their requirement.
