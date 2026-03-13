# FRAMEWORK.md - Complete Architecture Reference (TypeScript/Playwright)

**Version:** 2.0
**Status:** Authoritative Source of Truth

---

## 1. 5-Layer Architecture

Every test in the Isagawa QA Platform follows a strict separation of concerns. Each layer has one job. The architecture supports three test types: **UI**, **API**, and **Hybrid**.

| Layer | UI Path | API Path | Responsibility |
|-------|---------|----------|----------------|
| **Test** | `test('purchase item')` | `test('create user via API')` | Says what should happen, asserts the result |
| **Role** | `ReferenceRole.purchaseItem()` | `UserApiRole.createAndVerify()` | Coordinates tasks into business workflows |
| **Task** | `ReferenceTasks.checkoutWithInfo()` | `UserApiTasks.createUser()` | Performs one domain operation |
| **Page Object / Api Object** | `LoginPage.enterUsername()` | `UsersApi.create()` | Knows one page or one API resource |
| **BrowserInterface / ApiClient** | `BrowserInterface.click()` | `ApiClient.post()` | Wraps Playwright Page or APIRequestContext |

```
UI Path:                                    API Path:
Test (Arrange / Act / Assert)               Test (Arrange / Act / Assert)
  └─→ Role                                   └─→ Role
       └─→ Task                                    └─→ Task
            └─→ Page Object (fluent API)                └─→ Api Object (fluent API)
                 └─→ BrowserInterface                       └─→ ApiClient

Hybrid Path:
Test (Arrange / Act / Assert)
  └─→ Role
       └─→ Task (composes BOTH Page Objects and Api Objects)
            ├─→ Page Object → BrowserInterface
            └─→ Api Object  → ApiClient
```

---

## 2. Layer Details

### Layer 1: BrowserInterface (UI) / ApiClient (API)

The foundation layer. Two parallel interfaces, one per test type:

**BrowserInterface** — wraps Playwright's `Page` object:
- Built-in auto-waiting (Playwright native)
- Consistent API: `click`, `fill`, `getText`, `waitFor`, `screenshot`
- Configuration via `BrowserConfig.baseURL`

**ApiClient** — wraps Playwright's `APIRequestContext`:
- HTTP methods: `get`, `post`, `put`, `patch`, `delete`
- Typed responses via `ApiResponseData<T>` (status, body, headers, responseTime)
- Auth token management: `setAuthToken`, `clearAuthToken`
- Response validation: `assertStatus`, `assertStatusIn`
- Configuration via `ApiConfig.baseURL`

All browser interaction flows through BrowserInterface. All HTTP interaction flows through ApiClient. Page Objects never call Playwright directly. Api Objects never call `fetch` or `axios` directly.

### Layer 2: Page Object (POM) / Api Object

Each page in the application gets one Page Object class. Each API resource gets one Api Object class.

#### Page Object (UI)

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

#### Api Object (API)

```typescript
import { ApiClient, ApiResponseData } from '../../interfaces/api-client';

interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export class UsersApi {
  private lastResponse: ApiResponseData | null = null;

  constructor(private readonly api: ApiClient) {}

  // ==================== ENDPOINT CONFIG (Class Constants) ====================
  static readonly BASE_PATH = '/api/users';
  static readonly SINGLE_PATH = (id: number) => `/api/users/${id}`;

  // ==================== CRUD METHODS (One API Operation) ====================

  async create(data: CreateUserRequest): Promise<UsersApi> {
    this.lastResponse = await this.api.post<UserResponse>(
      UsersApi.BASE_PATH, { data },
    );
    return this;
  }

  async getById(id: number): Promise<UsersApi> {
    this.lastResponse = await this.api.get<UserResponse>(
      UsersApi.SINGLE_PATH(id),
    );
    return this;
  }

  // ==================== STATE-CHECK METHODS (For Assertions) ====================

  getLastStatus(): number {
    if (!this.lastResponse) throw new Error('No API call has been made yet');
    return this.lastResponse.status;
  }

  getLastBody<T = unknown>(): T {
    if (!this.lastResponse) throw new Error('No API call has been made yet');
    return this.lastResponse.body as T;
  }

  isLastStatusOk(): boolean {
    if (!this.lastResponse) return false;
    return this.lastResponse.status >= 200 && this.lastResponse.status < 300;
  }
}
```

**Key conventions (mirrors POM):**
- Constructor receives `ApiClient` via composition (no inheritance)
- Endpoint paths are `static readonly` class constants
- Typed request/response interfaces
- Async atomic methods — one API operation per method
- Return `this` for method chaining (fluent API)
- State-check methods for assertions (`getLastStatus`, `getLastBody`, `isLastStatusOk`)
- `lastResponse` stores the most recent `ApiResponseData` for state checks
- No `@autologger` decorator on Api Object methods

### Layer 3: Task

Tasks perform one domain operation, composing Page Objects (UI), Api Objects (API), or both (hybrid).

#### UI Task (composes Page Objects)

```typescript
import { BrowserInterface } from '../../interfaces/browser-interface';
import { autologger } from '../../utilities/autologger';
import { LoginPage } from '../pages/login-page';

export class ReferenceTasks {
  private readonly loginPage: LoginPage;

  constructor(browser: BrowserInterface) {
    this.loginPage = new LoginPage(browser);
  }

  @autologger('Task')
  async loginAsUser(username: string, password: string): Promise<void> {
    await (await this.loginPage.navigate()).enterUsername(username);
    await this.loginPage.enterPassword(password);
    await this.loginPage.clickLogin();
    // NO return
  }
}
```

#### API Task (composes Api Objects)

```typescript
import { ApiClient } from '../../interfaces/api-client';
import { autologger } from '../../utilities/autologger';
import { UsersApi } from '../apis/users-api';

export class UserApiTasks {
  private readonly usersApi: UsersApi;

  constructor(api: ApiClient) {
    this.usersApi = new UsersApi(api);
  }

  @autologger('Task')
  async createUser(name: string, email: string, role: string): Promise<void> {
    await this.usersApi.create({ name, email, role });
    // NO return
  }
}
```

#### Hybrid Task (composes both)

```typescript
import { ApiClient } from '../../interfaces/api-client';
import { BrowserInterface } from '../../interfaces/browser-interface';
import { autologger } from '../../utilities/autologger';
import { UsersApi } from '../apis/users-api';
import { InventoryPage } from '../pages/inventory-page';

export class HybridInventoryTasks {
  private readonly usersApi: UsersApi;
  private readonly inventoryPage: InventoryPage;

  constructor(api: ApiClient, browser: BrowserInterface) {
    this.usersApi = new UsersApi(api);
    this.inventoryPage = new InventoryPage(browser);
  }

  @autologger('Task')
  async seedUserAndVerifyInUI(name: string, email: string): Promise<void> {
    await this.usersApi.create({ name, email });       // API seed
    await this.inventoryPage.navigate();                // UI verify
    // NO return
  }
}
```

**Key conventions:**
- `@autologger('Task')` on every method (not constructor)
- Composes Page Objects, Api Objects, or both via constructor
- One domain operation per method
- Returns `Promise<void>` — Tests assert through POM/Api Object state-check methods
- Hybrid tasks receive both `ApiClient` and `BrowserInterface` in constructor

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
UI Path:
Test Data (JSON/@faker) ──► Test ──► Role ──► Task ──► POM ──► BrowserInterface ──► Browser
                              │                                       │
                              └──────── Assertions via POM checks ◄───┘

API Path:
Test Data (JSON/@faker) ──► Test ──► Role ──► Task ──► Api Object ──► ApiClient ──► HTTP
                              │                                            │
                              └──────── Assertions via Api Object checks ◄─┘

Hybrid Path:
Test Data ──► Test ──► Role ──► Task ──┬──► POM ──► BrowserInterface ──► Browser
                │                      └──► Api Object ──► ApiClient ──► HTTP
                │                                                  │
                └──────── Assertions via POM + Api Object checks ◄─┘
```

**Assertions flow upward:** Tests assert by calling POM state-check methods (UI) or Api Object state-check methods (API). Tasks and Roles never return values — this keeps the assertion boundary clean.

---

## 6. Test Fixtures

The `browser_interface`, `api_client`, and `dataGenerator` fixtures are defined in `tests/fixtures/index.ts`. Tests import from `'../fixtures'` (or `'../../fixtures'` depending on depth) to access:

- `browser_interface` — BrowserInterface instance wrapping Playwright's Page
- `api_client` — ApiClient instance wrapping Playwright's APIRequestContext
- `dataGenerator` — Faker-based utility for generating test data

```typescript
import { test, expect } from '../fixtures';

// UI test — only needs browser_interface
test('my UI test', async ({ browser_interface }) => {
  // browser_interface is ready to use
});

// API test — only needs api_client
test('my API test', async ({ api_client }) => {
  // api_client is ready to use
});

// Hybrid test — needs both
test('my hybrid test', async ({ browser_interface, api_client }) => {
  // both are ready to use
});
```

**API configuration:** `api_client` reads `API_BASE_URL` from environment (falls back to `BASE_URL`). Default headers include `Content-Type: application/json` and `Accept: application/json`. The underlying `APIRequestContext` is disposed automatically after each test.

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
| Api Object file | `kebab-case-api.ts` | `users-api.ts` |
| Api Object class | `PascalCase` + `Api` | `UsersApi` |
| Task file (UI) | `kebab-case-tasks.ts` | `reference-tasks.ts` |
| Task file (API) | `kebab-case-api-tasks.ts` | `reference-api-tasks.ts` |
| Task class | `PascalCase` + `Tasks` | `ReferenceTasks`, `UserApiTasks` |
| Role file | `kebab-case-role.ts` | `reference-role.ts` |
| Role class | `PascalCase` + `Role` | `ReferenceRole` |
| Test file (UI) | `test-kebab-case.spec.ts` | `test-reference-workflow.spec.ts` |
| Test file (API) | `test-kebab-case-api.spec.ts` | `test-reference-api-workflow.spec.ts` |
| Locator constant | `UPPER_SNAKE_CASE` | `USERNAME_INPUT` |
| Endpoint constant | `UPPER_SNAKE_CASE` or static method | `BASE_PATH`, `SINGLE_PATH(id)` |
| Method | `camelCase` | `enterUsername`, `getById` |
| State-check method | `is` or `get` prefix | `isLoggedIn`, `getLastStatus` |

---

## 9. Directory Structure

```
platform-playwright/
├── framework/
│   ├── _reference/            # Canonical patterns (read-only)
│   │   ├── apis/              # Reference Api Objects
│   │   ├── pages/             # Reference Page Objects
│   │   ├── tasks/             # Reference Tasks (UI, API, hybrid)
│   │   ├── roles/             # Reference Roles
│   │   └── tests/             # Reference Tests (UI + API)
│   ├── interfaces/
│   │   ├── browser-interface.ts   # UI foundation
│   │   └── api-client.ts         # API foundation
│   ├── utilities/
│   │   ├── autologger.ts
│   │   ├── logger.ts
│   │   └── data-generator.ts
│   ├── apis/                  # Generated Api Objects (by workflow)
│   │   └── {workflow}/
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
| Endpoint paths live ONLY in Api Objects | Api Object |
| No return values from Tasks or Roles | Task, Role |
| Return `this` from POM and Api Object atomic methods | POM, Api Object |
| Assert via POM state-check methods (UI) or Api Object state-check methods (API) | Test |
| `@autologger` on Task and Role methods | Task, Role |
| All methods are async (return Promise) | All |
| Never use `fetch`/`axios` — always use ApiClient | Api Object |
| Never call Playwright `Page` directly — always use BrowserInterface | POM |

---

## 11. Reference Implementations

Browse `framework/_reference/` for canonical code patterns:

| Layer | File | Type |
|-------|------|------|
| **POM** | `pages/login-page.ts`, `pages/inventory-page.ts`, `pages/cart-page.ts`, `pages/checkout-page.ts` | UI |
| **Api Object** | `apis/users-api.ts` | API |
| **Task (UI)** | `tasks/reference-tasks.ts` | UI |
| **Task (API + Hybrid)** | `tasks/reference-api-tasks.ts` | API, Hybrid |
| **Role** | `roles/reference-role.ts` | UI |
| **Test (UI)** | `tests/test-reference-workflow.spec.ts` | UI |
| **Test (API + Hybrid)** | `tests/test-reference-api-workflow.spec.ts` | API, Hybrid |

These are the authoritative source. When in doubt, read the reference implementations.
