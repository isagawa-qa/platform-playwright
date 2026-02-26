# FRAMEWORK.md - Complete Architecture Reference (TypeScript/Playwright)

**Version:** 1.0
**Status:** Authoritative Source of Truth

---

## 1. 5-Layer Architecture

Every test in the Isagawa QA Platform follows a strict separation of concerns. Each layer has one job:

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Test** | Says what should happen, asserts the result | `test('complete purchase as standard user')` |
| **Role** | Coordinates tasks into business workflows | `ReferenceRole.purchaseItem()` |
| **Task** | Performs one domain operation across pages | `ReferenceTasks.checkoutWithInfo()` |
| **Page Object (POM)** | Knows where elements are on one page | `LoginPage.enterUsername('standard_user')` |
| **BrowserInterface** | Wraps browser automation (Playwright) | `BrowserInterface.click()`, `.fill()` |

```
Test (Arrange / Act / Assert)
  └─→ Role (multi-task workflow, user persona)
       └─→ Task (single domain operation)
            └─→ Page Object (one page, atomic actions, fluent API)
                 └─→ BrowserInterface (Playwright wrapper, auto-waiting)
```

---

## 2. Layer Details

### Layer 1: BrowserInterface

The foundation layer. Wraps Playwright's Page object with:

- Built-in auto-waiting (Playwright native)
- Consistent API: `click`, `fill`, `getText`, `waitFor`, `screenshot`
- Configuration via `config.baseURL`

All browser interaction flows through this single interface. Page Objects never call Playwright directly.

### Layer 2: Page Object (POM)

Each page in the application gets one Page Object class.

```typescript
import { BrowserInterface } from '../../interfaces/browser-interface';

export class LoginPage {
  constructor(private readonly browser: BrowserInterface) {}

  // ==================== LOCATORS (Class Constants) ====================
  static readonly USERNAME_INPUT = '#user-name';
  static readonly PASSWORD_INPUT = '#password';
  static readonly LOGIN_BUTTON = '#login-button';
  static readonly ERROR_MESSAGE = '[data-test="error"]';

  // ==================== NAVIGATION ====================

  async navigate(): Promise<LoginPage> {
    await this.browser.navigateTo(this.browser.config.baseURL);
    return this;
  }

  // ==================== ATOMIC METHODS (One UI Action) ====================

  async enterUsername(username: string): Promise<LoginPage> {
    await this.browser.fill(LoginPage.USERNAME_INPUT, username);
    return this;
  }

  async enterPassword(password: string): Promise<LoginPage> {
    await this.browser.fill(LoginPage.PASSWORD_INPUT, password);
    return this;
  }

  async clickLogin(): Promise<LoginPage> {
    await this.browser.click(LoginPage.LOGIN_BUTTON);
    return this;
  }

  // ==================== STATE-CHECK METHODS (For Assertions) ====================

  async isErrorDisplayed(): Promise<boolean> {
    return await this.browser.isElementVisible(LoginPage.ERROR_MESSAGE, 3000);
  }

  async getErrorText(): Promise<string> {
    return await this.browser.getText(LoginPage.ERROR_MESSAGE);
  }

  async isLoginFormVisible(): Promise<boolean> {
    return await this.browser.isElementVisible(LoginPage.LOGIN_BUTTON, 5000);
  }
}
```

**Key conventions:**
- Constructor receives `BrowserInterface` via composition (no inheritance)
- Locators are `static readonly` class constants (UPPER_SNAKE_CASE)
- Async atomic methods — one UI action per method
- Return `this` for method chaining (fluent API)
- State-check methods for assertions (`is*`, `get*`)
- No `@autologger` decorator on POM methods

### Layer 3: Task

Tasks perform one domain operation, composing multiple Page Object calls.

```typescript
import { BrowserInterface } from '../../interfaces/browser-interface';
import { autologger } from '../../utilities/autologger';
import { LoginPage } from '../pages/login-page';
import { InventoryPage } from '../pages/inventory-page';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';

export class ReferenceTasks {
  private readonly loginPage: LoginPage;
  private readonly inventoryPage: InventoryPage;
  private readonly cartPage: CartPage;
  private readonly checkoutPage: CheckoutPage;

  constructor(browser: BrowserInterface) {
    this.loginPage = new LoginPage(browser);
    this.inventoryPage = new InventoryPage(browser);
    this.cartPage = new CartPage(browser);
    this.checkoutPage = new CheckoutPage(browser);
  }

  // ==================== TASK METHODS ====================

  @autologger('Task')
  async loginAsUser(username: string, password: string): Promise<void> {
    await (await this.loginPage.navigate())
      .enterUsername(username);
    await this.loginPage.enterPassword(password);
    await this.loginPage.clickLogin();
    // NO return
  }

  @autologger('Task')
  async addItemAndGoToCart(itemName: string): Promise<void> {
    await this.inventoryPage.addItemToCart(itemName);
    await this.inventoryPage.clickCart();
    // NO return
  }

  @autologger('Task')
  async checkoutWithInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.cartPage.clickCheckout();
    await this.checkoutPage.enterFirstName(firstName);
    await this.checkoutPage.enterLastName(lastName);
    await this.checkoutPage.enterPostalCode(postalCode);
    await this.checkoutPage.clickContinue();
    await this.checkoutPage.clickFinish();
    // NO return
  }
}
```

**Key conventions:**
- `@autologger('Task')` on every method (not constructor)
- Composes Page Objects via constructor
- One domain operation per method
- Returns `Promise<void>` — Tests assert through POM state-check methods

### Layer 4: Role

Roles represent user personas and orchestrate Tasks into complete business workflows.

```typescript
import { BrowserInterface } from '../../interfaces/browser-interface';
import { autologger } from '../../utilities/autologger';
import { ReferenceTasks } from '../tasks/reference-tasks';

export class ReferenceRole {
  private readonly tasks: ReferenceTasks;

  constructor(browser: BrowserInterface) {
    this.tasks = new ReferenceTasks(browser);
  }

  // ==================== WORKFLOW METHODS ====================

  @autologger('Role')
  async loginAndAddToCart(
    username: string,
    password: string,
    itemName: string,
  ): Promise<void> {
    await this.tasks.loginAsUser(username, password);
    await this.tasks.addItemAndGoToCart(itemName);
    // NO return - test asserts via POM
  }

  @autologger('Role')
  async purchaseItem(
    username: string,
    password: string,
    itemName: string,
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.tasks.loginAsUser(username, password);
    await this.tasks.addItemAndGoToCart(itemName);
    await this.tasks.checkoutWithInfo(firstName, lastName, postalCode);
    // NO return - test asserts via POM
  }
}
```

**Key conventions:**
- `@autologger('Role')` on workflow methods
- Composes Task modules
- Workflow methods call multiple Tasks in sequence
- Returns `Promise<void>` — never return values

### Layer 5: Test

Tests are thin — they call one Role workflow method and assert via POM state-check methods.

```typescript
import { test, expect } from '../../../tests/fixtures';
import { ReferenceRole } from '../roles/reference-role';
import { CheckoutPage } from '../pages/checkout-page';
import { InventoryPage } from '../pages/inventory-page';
import { faker } from '@faker-js/faker';

test.describe('Reference Workflow - Purchase Item', () => {
  test('complete purchase as standard user', async ({ browser_interface }) => {
    // Arrange - Generate test data + create role
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const postalCode = faker.location.zipCode();

    const user = new ReferenceRole(browser_interface);
    const checkoutPage = new CheckoutPage(browser_interface);

    // Act - ONE workflow call that orchestrates multiple operations
    await user.purchaseItem(
      'standard_user',
      'secret_sauce',
      'Sauce Labs Backpack',
      firstName,
      lastName,
      postalCode,
    );

    // Assert - Via Page Object state-check methods (NOT return value)
    expect(await checkoutPage.isOrderComplete()).toBe(true);
    expect(await checkoutPage.getCompleteHeaderText()).toBe('Thank you for your order!');
  });

  test('add item to cart as standard user', async ({ browser_interface }) => {
    // Arrange
    const user = new ReferenceRole(browser_interface);
    const inventoryPage = new InventoryPage(browser_interface);

    // Act - ONE workflow call
    await user.loginAndAddToCart(
      'standard_user',
      'secret_sauce',
      'Sauce Labs Backpack',
    );

    // Assert - Via POM state-check methods
    expect(await inventoryPage.isCartBadgeVisible()).toBe(true);
  });
});
```

**Key conventions:**
- AAA pattern: Arrange / Act / Assert
- `browser_interface` fixture provides the BrowserInterface instance (defined in `tests/fixtures/index.ts`)
- `@faker-js/faker` generates test data (names, addresses)
- Assert through POM state-check methods only
- One Role workflow call per test

---

## 3. Why 5 Layers?

The purchase test above demonstrates why each layer earns its place:

```
Test: 'complete purchase as standard user'
│
├─ ReferenceRole.purchaseItem()                    ← Role
│   ├─ ReferenceTasks.loginAsUser()                ← Task
│   │   └─ LoginPage: navigate → enter username → enter password → click login
│   │                                              ← POM → BrowserInterface
│   ├─ ReferenceTasks.addItemAndGoToCart()          ← Task
│   │   └─ InventoryPage: addItemToCart → clickCart
│   │                                              ← POM → BrowserInterface
│   └─ ReferenceTasks.checkoutWithInfo()            ← Task
│       └─ CartPage: clickCheckout                 ← POM → BrowserInterface
│          CheckoutPage: fill form → continue → finish
│                                                  ← POM → BrowserInterface
│
└─ Assert: isOrderComplete, getCompleteHeaderText
                                                   ← POM state-check methods
```

Remove any layer and the architecture degrades:
- **Remove Roles** → Tests must orchestrate tasks directly (duplication across tests)
- **Remove Tasks** → POM calls scatter across Roles (login + add + checkout inline per workflow)
- **Remove POMs** → Locators and Playwright calls leak into Tasks (unmaintainable)
- **Remove BrowserInterface** → Every POM talks directly to Playwright's Page API (no consistent abstraction)

---

## 4. Decorator Strategy

The `@autologger` decorator provides layer-by-layer runtime tracing. You can watch the full execution flow as it happens: which Role called which Task called which POM method.

| Layer | Decorator | On Constructor? |
|-------|-----------|-----------------|
| **POM** | None | No |
| **Task** | `@autologger('Task')` | No |
| **Role** | `@autologger('Role')` | No |
| **Test** | None | No |

---

## 5. Data Flow

```
Test Data (JSON/@faker) ──► Test ──► Role ──► Task ──► POM ──► BrowserInterface ──► Browser
                              │                                       │
                              └──────── Assertions via POM checks ◄───┘
```

**Assertions flow upward:** Tests assert by calling POM state-check methods. Tasks and Roles never return values — this keeps the assertion boundary clean.

---

## 6. Test Fixtures

The `browser_interface` and `dataGenerator` fixtures are defined in `tests/fixtures/index.ts`. Tests import from `'../fixtures'` (or `'../../fixtures'` depending on depth) to access:

- `browser_interface` — BrowserInterface instance wrapping Playwright's Page
- `dataGenerator` — Faker-based utility for generating test data

```typescript
import { test, expect } from '../fixtures';

test('my test', async ({ browser_interface }) => {
  // browser_interface is ready to use
});
```

---

## 7. TypeScript-Specific Patterns

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

## 8. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Page Object file | `kebab-case-page.ts` | `login-page.ts` |
| Page Object class | `PascalCase` | `LoginPage` |
| Task file | `kebab-case-tasks.ts` | `reference-tasks.ts` |
| Task class | `PascalCase` + `Tasks` | `ReferenceTasks` |
| Role file | `kebab-case-role.ts` | `reference-role.ts` |
| Role class | `PascalCase` + `Role` | `ReferenceRole` |
| Test file | `test-kebab-case.spec.ts` | `test-reference-workflow.spec.ts` |
| Locator constant | `UPPER_SNAKE_CASE` | `USERNAME_INPUT` |
| Method | `camelCase` | `enterUsername` |
| State-check method | `is` or `get` prefix | `isLoggedIn`, `getErrorText` |

---

## 9. Directory Structure

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

## 10. Key Rules

| Rule | Layer |
|------|-------|
| Locators live ONLY in Page Objects | POM |
| No return values from Tasks or Roles | Task, Role |
| Return `this` from POM atomic methods | POM |
| Assert via POM state-check methods | Test |
| `@autologger` on Task and Role methods | Task, Role |
| All methods are async (return Promise) | All |

---

## 11. Reference Implementations

Browse `framework/_reference/` for canonical code patterns:

| Layer | File |
|-------|------|
| **POM** | `pages/login-page.ts`, `pages/inventory-page.ts`, `pages/cart-page.ts`, `pages/checkout-page.ts` |
| **Task** | `tasks/reference-tasks.ts` |
| **Role** | `roles/reference-role.ts` |
| **Test** | `tests/test-reference-workflow.spec.ts` |

These are the authoritative source. When in doubt, read the reference implementations.
