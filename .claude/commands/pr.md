---
description: Instant PR review — validates code against framework patterns like a senior SDET would
---

# /pr — Instant Code Review

What takes 30-60 min in a PR cycle, done in 5 seconds.

---

## Instructions

### 1. Scan Directories

**Run all four scans and show output:**

```
Glob: framework/pages/**/*.ts
Glob: framework/tasks/**/*.ts
Glob: framework/roles/**/*.ts
Glob: tests/**/*.spec.ts
```

Exclude `framework/_reference/` (those are canonical patterns, not review targets).

### 2. Layer Architecture Checks

#### POM Layer (`framework/pages/**/*.ts`)
- [x] Has locators as `static readonly` class constants
- [x] Has atomic methods returning `this` (fluent API)
- [x] Has state-check methods (`is*()`, `get*()`, `has*()`)
- [x] Constructor takes `BrowserInterface`
- [ ] VIOLATION: Has `@autologger` decorator (POMs don't use it)
- [ ] VIOLATION: Imports from tasks/ or roles/
- [ ] VIOLATION: Hardcoded URLs — must use config or navigate method
- [ ] VIOLATION: Contains `page.waitForTimeout()` — use BrowserInterface wait methods

#### Task Layer (`framework/tasks/**/*.ts`)
- [x] Has `@autologger('Task')` decorator on methods
- [x] Methods return `Promise<void>` (no return values)
- [x] Imports from pages/ only
- [x] Composes POMs via constructor
- [ ] VIOLATION: Contains locator strings or selectors (locators belong in POMs only)
- [ ] VIOLATION: Imports from roles/
- [ ] VIOLATION: Direct navigation — Tasks must call POM navigate() methods
- [ ] VIOLATION: Returns a value (Tasks return void)

#### Role Layer (`framework/roles/**/*.ts`)
- [x] Has `@autologger('Role')` decorator on methods
- [x] Methods return `Promise<void>` (no return values)
- [x] Imports from tasks/ only
- [x] Composes Tasks via constructor
- [ ] VIOLATION: Contains locator strings or selectors
- [ ] VIOLATION: Imports from pages/ directly (Roles compose Tasks, not POMs)
- [ ] VIOLATION: Direct navigation — Roles must NOT navigate
- [ ] VIOLATION: Returns a value (Roles return void)

#### Test Layer (`tests/**/*.spec.ts`)
- [x] Uses `test()` from Playwright fixtures
- [x] Imports Role from roles/
- [x] Imports POM from pages/ (for assertions only)
- [x] Uses POM state-check methods in `expect()` assertions
- [x] Follows AAA pattern (Arrange / Act / Assert)
- [ ] VIOLATION: Contains locator strings or selectors
- [ ] VIOLATION: Imports from tasks/ directly (Tests use Roles, not Tasks)
- [ ] VIOLATION: Calls multiple Role methods (should call ONE workflow method)
- [ ] VIOLATION: Calls POM action methods (Tests only use POM state-check methods for assertions)

### 3. Senior SDET Quality Checks

#### Code Quality (Any violation triggers HITL)
- [ ] VIOLATION: `page.waitForTimeout()` calls — use BrowserInterface wait methods
- [ ] VIOLATION: Hardcoded credentials — use config/fixtures (unless user specifies otherwise)
- [ ] VIOLATION: Magic numbers without explanation
- [ ] VIOLATION: Missing type annotations on public methods
- [ ] VIOLATION: `any` type usage — use specific types

#### Naming Conventions
- [ ] VIOLATION: Methods not camelCase
- [ ] VIOLATION: Classes not PascalCase
- [ ] VIOLATION: Locator constants not SCREAMING_SNAKE_CASE
- [ ] VIOLATION: Files not kebab-case (e.g., `login-page.ts`, not `loginPage.ts`)

#### Test Quality
- [ ] VIOLATION: Test without assertions (`expect()`)
- [ ] VIOLATION: Test depends on another test's state
- [ ] VIOLATION: Bare `catch {}` without specific exception handling

#### Wait Patterns
- [ ] VIOLATION: Raw `page.waitForTimeout()` instead of BrowserInterface waits
- [ ] VIOLATION: Manual polling loops instead of BrowserInterface methods
- [ ] VIOLATION: No timeout parameter on wait calls

#### BrowserInterface Usage
- [ ] VIOLATION: Wrapping BrowserInterface methods instead of calling directly
- [ ] VIOLATION: Creating new wait/click/fill methods when BrowserInterface already has them
- [ ] NOTE: If a needed method doesn't exist in BrowserInterface, trigger HITL

---

## CRITICAL: HITL Protocol

### Rule: STOP on Violation
1. **STOP** — Do not attempt autonomous fixes
2. **REPORT** — Show violations with file:line references
3. **WAIT** — Get human decision before proceeding

---

## Report Format

### If All Pass:

```
PR REVIEW: APPROVED

Files scanned: [count]
Violations: 0

Ready to merge.
```

### If Violations Found (HITL Triggered):

```
PR REVIEW: CHANGES REQUESTED

VIOLATIONS:

1. [CRITICAL] framework/tasks/checkout/checkout-tasks.ts:15
   → Contains locator string '#cart-button' (locators belong in POMs)

2. [HIGH] framework/pages/auth/login-page.ts:42
   → page.waitForTimeout(500) — use BrowserInterface wait method

OPTIONS:
1. Fix all — I'll propose fixes for approval
2. Fix critical only — Skip medium/low
3. I'll fix manually — just show me the list
4. Ignore — proceed anyway
5. Abort — stop review

Which option?
```

## Severity Levels

| Severity | Description | Examples |
|----------|-------------|----------|
| CRITICAL | Breaks architecture | Locators in Task, Role imports pages, Tests call Tasks |
| HIGH | Best practice violation | waitForTimeout(), hardcoded creds, missing types |
| MEDIUM | Code quality issue | Naming convention, bare catch, magic numbers |
| LOW | Style/preference | Minor formatting |
