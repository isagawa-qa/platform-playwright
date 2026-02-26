# FRAMEWORK.md - Complete Architecture Reference (TypeScript/Playwright)

**Version:** 1.0
**Status:** Authoritative Source of Truth

---

## 1. 5-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ TEST                                                                 │
│ - Playwright test() with test.describe()                             │
│ - Load data from JSON or @faker-js/faker                             │
│ - Call Role workflow methods (chain when workflow requires it)        │
│ - Assert via Page Object state-check methods directly                │
│ - NO test-level orchestration (belongs in Role layer)                │
└─────────────────────────────────────────────────────────────────────┘
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ROLE                                                                 │
│ - @autologger('Role') on workflow methods                            │
│ - Composes Task modules (instantiates in constructor)                │
│ - Workflow methods call MULTIPLE Tasks in sequence                   │
│ - NO return values (void)                                            │
│ - NO locators                                                        │
└─────────────────────────────────────────────────────────────────────┘
                              │ composes
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ TASK                                                                 │
│ - @autologger('Task') on all methods                                 │
│ - NO decorator on constructor                                        │
│ - Composes Page Objects (instantiates in constructor)                │
│ - One domain operation per method (SRP)                              │
│ - NO return values (void)                                            │
│ - NO locators (only in POMs)                                         │
│ - Uses fluent POM API (method chaining)                              │
└─────────────────────────────────────────────────────────────────────┘
                              │ composes
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PAGE OBJECT                                                          │
│ - NO decorators on any methods                                       │
│ - Locators as static readonly constants (UPPER_SNAKE_CASE)           │
│ - Async atomic methods (one UI action per method)                    │
│ - Return this for fluent chaining                                    │
│ - State-check methods for test assertions (return boolean/string)    │
│ - Composes BrowserInterface                                          │
└─────────────────────────────────────────────────────────────────────┘
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ BROWSER INTERFACE                                                    │
│ - Wraps Playwright Page object                                       │
│ - Built-in auto-waiting (Playwright native)                          │
│ - NO decorators                                                      │
│ - Provides: click, fill, getText, waitFor, screenshot, etc.          │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Test Data (JSON/@faker) ──► Test ──► Role ──► Task ──► POM ──► BrowserInterface ──► Browser
                              │                                       │
                              └──────── Assertions via POM checks ◄───┘
```

### Key Architecture Rules

1. **No Inheritance** - Use composition, no base classes
2. **Locators ONLY in Page Objects** - Never in Tasks, Roles, or Tests
3. **Assertions via Page Objects** - Tests use POM state-check methods
4. **Single Responsibility** - Each layer has ONE job
5. **Exceptions Bubble Up** - Errors propagate from POM → Task → Role → Test

---

## 2. OOP Principles

| Principle | Implementation |
|-----------|----------------|
| **Encapsulation** | Each layer hides internals. Pages hide locators, Tasks hide page orchestration |
| **Composition** | Roles COMPOSE Tasks. Tasks COMPOSE Page Objects. No inheritance |
| **SRP** | Pages = UI actions. Tasks = domain operations. Roles = workflows. Tests = assertions |
| **Separation of Concerns** | Locators ONLY in POMs. Orchestration ONLY in Roles. Assertions ONLY in Tests |
| **Abstraction** | Higher layers don't know lower-layer details |

---

## 3. Layer Rules Summary

| Layer | Decorator | Return Value | Composes | Fluent API |
|-------|-----------|--------------|----------|------------|
| **Page Object** | None | `this` (Promise) | BrowserInterface | Yes |
| **Task** | `@autologger('Task')` | void (Promise) | Page Objects | No (uses POM fluent) |
| **Role** | `@autologger('Role')` | void (Promise) | Tasks | No |
| **Test** | None | N/A | Roles + POMs (assert) | No |

### Critical Rules

- **Tasks return void** — Tests assert via POM state-check methods
- **Roles return void** — Tests assert via POM state-check methods
- **POMs return this** — Enables fluent chaining for Tasks
- **State-check methods return boolean/string** — For test assertions

---

## 4. TypeScript-Specific Patterns

### Locators

```typescript
// CORRECT: Static readonly constants
static readonly USERNAME_INPUT = '#user-name';
static readonly LOGIN_BUTTON = '[data-test="login-button"]';

// WRONG: Instance properties, dynamic strings
this.usernameInput = '#user-name';  // ✗
```

### Async/Await

All interactions are async. Every method returns a Promise:

```typescript
async enterUsername(username: string): Promise<LoginPage> {
  await this.browser.fill(LoginPage.USERNAME_INPUT, username);
  return this;
}
```

### Test Fixtures

```typescript
import { test, expect } from '../fixtures';

test('my test', async ({ browser_interface }) => {
  // browser_interface is the BrowserInterface fixture
});
```

### Decorator Usage

```typescript
import { autologger } from '../../utilities/autologger';

class MyTask {
  @autologger('Task')
  async doSomething(): Promise<void> {
    // method body
  }
}
```

---

## 5. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Page Object file | `kebab-case-page.ts` | `login-page.ts` |
| Page Object class | `PascalCase` | `LoginPage` |
| Task file | `kebab-case-tasks.ts` | `auth-tasks.ts` |
| Task class | `PascalCase` + `Tasks` | `AuthTasks` |
| Role file | `kebab-case-role.ts` | `standard-user-role.ts` |
| Role class | `PascalCase` + `Role` | `StandardUserRole` |
| Test file | `test-kebab-case.spec.ts` | `test-login.spec.ts` |
| Locator constant | `UPPER_SNAKE_CASE` | `USERNAME_INPUT` |
| Method | `camelCase` | `enterUsername` |
| State-check method | `is` or `get` prefix | `isLoggedIn`, `getErrorText` |

---

## 6. Directory Structure

```
platform-playwright/
├── framework/
│   ├── _reference/            # Canonical patterns (read-only)
│   │   ├── pages/
│   │   ├── tasks/
│   │   ├── roles/
│   │   └── tests/
│   ├── interfaces/
│   │   └── browser-interface.ts
│   ├── utilities/
│   │   ├── autologger.ts
│   │   ├── logger.ts
│   │   └── data-generator.ts
│   ├── pages/                 # Generated POMs (by workflow)
│   │   └── {workflow}/
│   ├── tasks/                 # Generated Tasks (by workflow)
│   │   └── {workflow}/
│   └── roles/                 # Generated Roles (by workflow)
│       └── {workflow}/
├── tests/
│   ├── data/                  # Shared test data
│   ├── fixtures/              # Playwright test fixtures
│   │   └── index.ts
│   └── {workflow}/            # Generated tests (by workflow)
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

---

## 7. Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

---

*This is the authoritative architecture reference for the TypeScript/Playwright QA platform.*
