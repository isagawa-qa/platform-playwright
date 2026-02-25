# Pre-Construction Checkpoint

**Invoke:** Before writing ANY code in Step 4 (Construction Phase)

---

## MANDATORY: Complete Before Writing Code

### 0. Reuse Check — MANDATORY SCAN (ALL THREE LAYERS)

**BLOCKING: Scan pages, tasks, AND roles. Show output. Check for duplicates.**

```
ACTION REQUIRED — SCAN ALL THREE DIRECTORIES:

1. Glob: framework/pages/**/*.ts
2. Glob: framework/tasks/**/*.ts
3. Glob: framework/roles/**/*.ts

SHOW all output. CHECK each layer for duplicates.
```

**Duplicate = same filename in different workflows:**
- `framework/pages/workflow_A/login-page.ts` + `framework/pages/workflow_B/login-page.ts` → DUPLICATE
- `framework/tasks/workflow_A/auth-tasks.ts` + `framework/tasks/workflow_B/auth-tasks.ts` → DUPLICATE

**When ANY duplicate found in ANY layer, STOP and ask:**

```
DUPLICATES DETECTED
===================

PAGES:
  login-page.ts exists in:
    → framework/pages/goal-management/login-page.ts
    → framework/pages/lead-capture/login-page.ts

TASKS:
  (check for duplicates)

ROLES:
  (check for duplicates)

OPTIONS:
1. CONSOLIDATE NOW — Move ALL duplicates to common/, update imports
2. CONTINUE — Proceed, consolidate later (adds technical debt)

Which option?
```

**Generic modules (consolidate to common/):**
- Pages: LoginPage, LogoutPage, NavigationPage, HeaderPage, SearchPage
- Tasks: AuthTasks, NavigationTasks (login/logout flows)
- Roles: Shared authentication roles

**Workflow-specific (keep separate):** GoalsPage, BookingPage, domain-unique modules

---

### 1. Read Lessons Learned FIRST

**BEFORE writing ANY code, read lessons.md:**

```
.claude/lessons/lessons.md
```

**Extract and APPLY all lessons to your code:**
- Wait patterns (Playwright auto-wait, explicit waits)
- Locator patterns (page.locator(), page.getByRole(), data-testid)
- Anti-patterns to avoid
- Quality gates that were added

**DO NOT repeat mistakes that are already documented.**

---

### 2. Read Reference Files

You MUST read these files NOW (not from memory):

```
framework/_reference/pages/*.ts    → POM patterns
framework/_reference/tasks/*.ts    → Task patterns
framework/_reference/roles/*.ts    → Role patterns
framework/_reference/tests/*.ts    → Test patterns
```

**Read each file. Extract patterns. Apply to your code.**

### 3. Check BrowserInterface Methods

Before writing ANY interaction logic:

1. **READ** `framework/interfaces/browser-interface.ts`
2. **LIST** methods available (click, fill, waitForElementVisible, etc.)
3. **USE** existing methods — do not create workarounds

### 4. Forbidden Patterns

Do NOT use these in generated code:

```typescript
// FORBIDDEN in POMs:
await page.waitForTimeout(500);    // Use BrowserInterface wait methods

// FORBIDDEN in Tasks:
static readonly LOCATOR = '...';   // Locators belong in POMs only

// FORBIDDEN everywhere:
try {
    ...
} catch {                          // Never bare catch
    // swallowed
}
```

### 5. Layer Rules Reminder

| Layer | Returns | Contains |
|-------|---------|----------|
| POM | `this` | Locators, atomic methods (return this), state-check methods |
| Task | `void` | Workflow orchestration, @autologger decorator |
| Role | `void` | Multi-task workflows, @autologger decorator |
| Test | N/A | ONE role call, assertions via POM state methods |

---

## Confirmation

**You MUST confirm each item was DONE (not just understood):**

- [ ] I SCANNED all 3 layers (Glob) and SHOWED output
- [ ] I CHECKED for duplicate filenames, PRESENTED HITL if found
- [ ] I READ lessons.md and will APPLY all lessons to my code
- [ ] I READ reference files (not from memory)
- [ ] I CHECKED BrowserInterface methods

**If you skipped lessons.md, GO BACK AND READ IT.**

**Now proceed with code generation.**
