# Reference Implementation

**Purpose:** Canonical TypeScript/Playwright code patterns for AI to learn from before generating any layer code.

---

## AI Instructions

**BEFORE generating any POM, Task, Role, or Test code, you MUST read these files:**

| Layer | File to Read | Learn |
|-------|--------------|-------|
| **POM** | `pages/login-page.ts` | Locators as static constants, atomic methods, state-check methods, return `this` |
| **Task** | `tasks/reference-tasks.ts` | `@autologger`, POM composition, no returns, fluent API |
| **Role** | `roles/reference-role.ts` | `@autologger`, Task composition, workflow orchestration |
| **Test** | `tests/test-reference-workflow.spec.ts` | AAA pattern, fixtures, Role calls, POM assertions |

---

## 5-Layer Pattern Summary (TypeScript)

### BrowserInterface (Layer 0)
```typescript
// Wraps Playwright Page object
// Built-in auto-waiting (Playwright native)
// NO decorators
// Provides: click, fill, getText, waitFor methods, etc.
```

### POM (Page Object Model)
```typescript
// NO decorators
// Locators as static readonly class constants
// Async atomic methods (one UI action)
// Return this for fluent chaining
// State-check methods for assertions (return boolean/string)
```

### Task
```typescript
// @autologger('Task') on methods
// NO decorator on constructor
// Composes Page Objects
// One domain operation per method
// NO return values (void)
```

### Role
```typescript
// @autologger('Role') on workflow methods
// Composes Task modules
// Workflow methods call MULTIPLE tasks
// NO return values (void)
// NO locators
```

### Test
```typescript
// Playwright test.describe / test()
// Call ONE Role workflow method per test
// Assert via Page Object state-check methods
// NO orchestration (Role handles workflow)
```

---

## Key Rules

| Rule | Enforced In |
|------|-------------|
| NO locators in Tasks/Roles/Tests | Task, Role, Test |
| NO return values from Tasks/Roles | Task, Role |
| Return `this` from POM atomic methods | POM |
| Assert via POM state-check methods | Test |
| ONE Role workflow call per test | Test |
| `@autologger` on Task/Role methods | Task, Role |

---

## File Structure

```
_reference/
├── README.md                              ← You are here
├── pages/
│   ├── login-page.ts                      ← POM pattern
│   ├── inventory-page.ts                  ← POM pattern
│   ├── cart-page.ts                       ← POM pattern
│   └── checkout-page.ts                   ← POM pattern
├── tasks/
│   └── reference-tasks.ts                 ← Task pattern
├── roles/
│   └── reference-role.ts                  ← Role pattern
└── tests/
    └── test-reference-workflow.spec.ts    ← Test pattern
```

---

*This is the authoritative source for TypeScript/Playwright code patterns. When in doubt, read these files.*
