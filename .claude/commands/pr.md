---
description: Instant PR review — validates code against framework patterns like a senior SDET would
---

# /pr — Instant Code Review

What takes 30-60 min in a PR cycle, done in 5 seconds.

---

## Instructions

### 1. Scan Directories

Scan all framework layers:
- `framework/pages/` — Page Objects (POMs)
- `framework/tasks/` — Task modules
- `framework/roles/` — Role modules
- `tests/` — Test files (exclude fixtures/)

### 2. Layer Architecture Checks

#### POM Layer (`framework/pages/**/*.ts`)
- [x] Has locators as static readonly class constants
- [x] Has atomic methods returning `this`
- [x] Has state-check methods (`is*`, `get*`, `has*`)
- [ ] VIOLATION: Has `@autologger` decorator (POMs don't use it)
- [ ] VIOLATION: Imports from tasks/ or roles/

#### Task Layer (`framework/tasks/**/*.ts`)
- [x] Has `@autologger('Task')` decorator
- [x] Methods return `void` (no return statements with values)
- [x] Imports from pages/ only
- [ ] VIOLATION: Contains locator strings or selectors
- [ ] VIOLATION: Imports from roles/

#### Role Layer (`framework/roles/**/*.ts`)
- [x] Has `@autologger('Role')` decorator
- [x] Methods return `void` (no return statements with values)
- [x] Imports from tasks/ only
- [ ] VIOLATION: Contains locator strings or selectors
- [ ] VIOLATION: Imports from pages/ directly

#### Test Layer (`tests/**/*.spec.ts`)
- [x] Uses `test()` from Playwright/fixtures
- [x] Imports Role from roles/
- [x] Imports POM from pages/ (for assertions only)
- [x] Uses POM state-check methods in assertions
- [ ] VIOLATION: Contains locator strings or selectors
- [ ] VIOLATION: Imports from tasks/ directly
- [ ] VIOLATION: Calls multiple Role methods (should call ONE workflow method)

### 3. Senior SDET Quality Checks

#### Code Quality (Any violation triggers HITL)
- [ ] VIOLATION: `page.waitForTimeout()` calls — use BrowserInterface wait methods
- [ ] VIOLATION: Hardcoded credentials — use config/fixtures (unless user specifies otherwise)
- [ ] VIOLATION: Magic numbers without explanation
- [ ] VIOLATION: Missing type annotations on public methods

#### Naming Conventions
- [ ] VIOLATION: Methods not camelCase
- [ ] VIOLATION: Classes not PascalCase
- [ ] VIOLATION: Locator constants not SCREAMING_SNAKE_CASE
- [ ] VIOLATION: Files not kebab-case

#### Test Quality
- [ ] VIOLATION: Test without assertions
- [ ] VIOLATION: Test depends on another test's state
- [ ] VIOLATION: Bare `catch {}` without specific exception

#### Wait Patterns
- [ ] VIOLATION: Raw `page.waitForTimeout()` instead of BrowserInterface waits
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
PR REVIEW: APPROVED (file count, 0 violations, ready to merge)

### If Violations Found (HITL Triggered):
PR REVIEW: CHANGES REQUESTED (file:line violations, 5 numbered options for user)

## Severity Levels
| Severity | Description | Examples |
|----------|-------------|----------|
| CRITICAL | Breaks architecture | Locators in Task, Role imports pages |
| HIGH | Best practice violation | waitForTimeout(), hardcoded creds |
| MEDIUM | Code quality issue | Missing types, naming convention |
| LOW | Style/preference | Minor formatting |
