# Framework Architecture

<!-- Seeded: expert knowledge for autonomous test generation -->

## The 5-Layer Architecture

All test code follows a strict 5-layer separation. Each layer has specific responsibilities
and restrictions. The architecture supports UI, API, and hybrid test types.

```
UI Path:   Test → Role → Task → POM        → BrowserInterface → Browser
API Path:  Test → Role → Task → Api Object  → ApiClient        → HTTP
Hybrid:    Test → Role → Task → POM + Api Object → BI + ApiClient
```

| Layer | UI | API | Decorator | Returns |
|-------|-----|-----|-----------|---------|
| **BrowserInterface** | Wraps Playwright Page | — | None | Various |
| **ApiClient** | — | Wraps Playwright APIRequestContext | None | `ApiResponseData<T>` |
| **Page Object (POM)** | One page's elements and atomic interactions | — | None | `this` (fluent) |
| **Api Object** | — | One resource's endpoints and operations | None | `this` (fluent) |
| **Task** | One domain operation composing POMs | One domain operation composing Api Objects (or both) | `@autologger('Task')` | `void` |
| **Role** | User persona orchestrating Tasks | Same | `@autologger('Role')` | `void` |
| **Test** | Arrange/Act/Assert | Same | None | N/A |

## BrowserInterface-First Rule (CRITICAL)

**ALL browser interactions go through BrowserInterface. No exceptions.**

- Never call `page.click()`, `page.fill()`, `page.getByRole()` directly
- Always use `this.browser.click(selector)`, `this.browser.fill(selector, text)`, etc.
- BrowserInterface provides: logging, screenshot-on-failure, centralized timeouts

**If BrowserInterface doesn't have a method for your use case, BUILD ONE.**
Do not bypass BI by calling Playwright's Page API directly. Extend BI instead.

```typescript
// WRONG — bypasses BrowserInterface
await this.page.getByRole('button', { name: 'Submit' }).click();

// CORRECT — goes through BrowserInterface
await this.browser.click('role=button[name="Submit"]');
```

## ApiClient-First Rule (CRITICAL)

**ALL HTTP interactions go through ApiClient. No exceptions.**

- Never call `fetch()`, `axios`, or `request.get()` directly
- Always use `this.api.get(endpoint)`, `this.api.post(endpoint, { data })`, etc.
- ApiClient provides: logging, response timing, auth token management, typed responses

**If ApiClient doesn't have a method for your use case, BUILD ONE.**
Do not bypass ApiClient by calling Playwright's APIRequestContext or `fetch` directly.

```typescript
// WRONG — bypasses ApiClient
const response = await this.request.get('/api/users');

// CORRECT — goes through ApiClient
const response = await this.api.get<UserResponse>('/api/users');
```

## POM Rules

- Locators are `static readonly` constants in UPPER_SNAKE_CASE
- Every atomic method returns `Promise<PageClass>` and `return this` (fluent chaining)
- State-check methods return `Promise<boolean>` or `Promise<string>` (for assertions)
- No decorators on POM methods
- No return values from action methods (only state-check methods return values)

```typescript
export class LoginPage {
  static readonly USERNAME_INPUT = 'role=textbox[name="Username"]';
  static readonly PASSWORD_INPUT = 'role=textbox[name="Password"]';
  static readonly LOGIN_BUTTON = 'role=button[name="Log in"]';
  static readonly ERROR_MESSAGE = 'role=alert';

  constructor(private readonly browser: BrowserInterface) {}

  async enterUsername(username: string): Promise<LoginPage> {
    await this.browser.fill(LoginPage.USERNAME_INPUT, username);
    return this;
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.browser.isElementVisible(LoginPage.ERROR_MESSAGE, 3000);
  }
}
```

## Api Object Rules

- Endpoint paths are `static readonly` constants or static methods
- Every atomic method returns `Promise<ApiObjectClass>` and `return this` (fluent chaining)
- State-check methods for assertions (`getLastStatus`, `getLastBody`, `isLastStatusOk`)
- Stores `lastResponse: ApiResponseData` for state checks
- Typed request/response interfaces per resource
- No decorators on Api Object methods
- No hardcoded URLs — use static endpoint constants

```typescript
export class UsersApi {
  private lastResponse: ApiResponseData | null = null;

  static readonly BASE_PATH = '/api/users';
  static readonly SINGLE_PATH = (id: number) => `/api/users/${id}`;

  constructor(private readonly api: ApiClient) {}

  async create(data: CreateUserRequest): Promise<UsersApi> {
    this.lastResponse = await this.api.post<UserResponse>(UsersApi.BASE_PATH, { data });
    return this;
  }

  getLastStatus(): number {
    if (!this.lastResponse) throw new Error('No API call has been made yet');
    return this.lastResponse.status;
  }
}
```

## Task Rules

- One domain operation (e.g., "login", "add item to cart", "create user via API")
- UI tasks compose POM methods — never contains selectors
- API tasks compose Api Object methods — never contains endpoint URLs
- Hybrid tasks compose both POMs and Api Objects
- Returns `void` — assertions happen in Tests via POM/Api Object state-check methods
- Uses `@autologger('Task')` decorator

## Role Rules

- User persona (e.g., "StandardUser", "AdminUser")
- Orchestrates Tasks — never calls POM or Api Object methods directly
- Returns `void`
- Uses `@autologger('Role')` decorator

## Test Rules

- Strict AAA pattern: Arrange / Act / Assert
- Act section: ONE Role workflow call
- Assert section: POM state-check methods (UI), Api Object state-check methods (API), or both (hybrid)
- Never contains selectors, endpoint URLs, POM action calls, or Task calls
- UI tests use `browser_interface` fixture — never touches `page` directly
- API tests use `api_client` fixture — never calls `fetch` directly
- Hybrid tests destructure both fixtures

## Layer Violations (Anti-Patterns)

- Test calling Task directly (skip Role)
- Test calling POM/Api Object action methods (skip Role + Task)
- Task containing selectors or endpoint URLs (should be in POM/Api Object)
- POM calling `page` directly (should use BrowserInterface)
- Api Object calling `fetch`/`axios`/`request` directly (should use ApiClient)
- Any layer calling Playwright API directly instead of through BrowserInterface/ApiClient

## Composition Over Inheritance

- No base classes. BrowserInterface/ApiClient are injected via constructor (composition).
- POMs receive BrowserInterface, Api Objects receive ApiClient
- Tasks receive POMs and/or Api Objects, Roles receive Tasks
- Fluent API on POMs and Api Objects enables readable Task code
- Hybrid Tasks receive both BrowserInterface and ApiClient in constructor

---

*Seeded from platform-playwright reference implementation and FRAMEWORK.md.*
