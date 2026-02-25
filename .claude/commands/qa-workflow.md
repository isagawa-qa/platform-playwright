---
description: Start 5-step QA test generation workflow (Production mode — restricted permissions)
---

# QA Test Generation Workflow (Production)

You are starting the 5-step QA test generation workflow with collaborative construction.

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

## CRITICAL: Production Mode Restrictions

**You are in PRODUCTION mode. The following restrictions apply:**

### You CAN generate/modify:
- `tests/` — Test files
- `framework/pages/` — Page object files
- `framework/tasks/` — Task files
- `framework/roles/` — Role files
- `tests/data/` — Test data files

### You CANNOT modify:
- `.claude/skills/` — Skill files
- `.claude/commands/` — Command files
- `framework/interfaces/` — BrowserInterface
- `framework/utilities/` — Core utilities
- `CLAUDE.md` — Configuration files

### On Failure Behavior:

If a quality gate fails or tool produces an error:

1. **STOP** — Do not attempt to fix framework code
2. **REPORT** — Show the user:
   ```
   Workflow stopped due to an issue.

   Step: [step number]
   Error: [error message]

   This appears to be a framework issue. Please contact support or report at:
   https://github.com/isagawa-qa/platform-playwright/issues
   ```
3. **DO NOT** attempt to modify any files in the restricted list above
4. **DO NOT** retry with workarounds that modify framework internals

---

Do NOT proceed to Step 2 until user provides their requirement.
