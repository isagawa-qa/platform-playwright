# Hybrid Testing (API + UI)

<!-- Seeded: expert knowledge for combining API and UI testing -->

## When to Use Hybrid Tests

| Pattern | Use Case |
|---------|----------|
| **API seed → UI verify** | Create data via API, verify it renders correctly in the browser |
| **UI action → API verify** | Perform user action in browser, verify backend state via API |
| **API cleanup** | Use API in teardown to remove test data created by UI tests |
| **Auth via API** | Authenticate via API to get token, use in both API and UI contexts |

## Shared Auth State

Playwright's `APIRequestContext` and browser contexts can share authentication state.

```typescript
// In fixture: authenticate via API, store state for browser
api_client: async ({ playwright }, use) => {
  const config: ApiConfig = {
    baseURL: process.env.API_BASE_URL || process.env.BASE_URL,
    defaultTimeout: 30000,
    defaultHeaders: { 'Content-Type': 'application/json' },
  };

  const requestContext = await playwright.request.newContext({
    baseURL: config.baseURL,
    extraHTTPHeaders: config.defaultHeaders,
  });

  const logger = new Logger('ApiClient');
  const apiClient = new ApiClient(requestContext, config, logger);

  await use(apiClient);
  await requestContext.dispose();
};
```

## Hybrid Task Patterns

### API Seed → UI Verify

```typescript
export class HybridTasks {
  constructor(api: ApiClient, browser: BrowserInterface) {
    this.usersApi = new UsersApi(api);
    this.usersPage = new UsersPage(browser);
  }

  @autologger('Task')
  async seedUserAndVerifyInUI(name: string, email: string): Promise<void> {
    // Step 1: Create data via API (fast, reliable)
    await this.usersApi.create({ name, email });

    // Step 2: Navigate to UI and verify rendering
    await this.usersPage.navigate();
    // Test asserts via POM state-check methods
  }
}
```

### UI Action → API Verify

```typescript
@autologger('Task')
async submitFormAndVerifyViaAPI(formData: FormInput, userId: number): Promise<void> {
  // Step 1: Fill and submit form in UI
  await this.formPage.fillForm(formData);
  await this.formPage.clickSubmit();

  // Step 2: Verify backend state via API
  await this.usersApi.getById(userId);
  // Test asserts via Api Object state-check methods
}
```

### API Cleanup in Teardown

```typescript
test('create user via UI', async ({ browser_interface, api_client }) => {
  const usersApi = new UsersApi(api_client);
  let createdUserId: number | null = null;

  try {
    // Act — create user via UI
    const tasks = new UserTasks(browser_interface);
    await tasks.createUser('Test User', 'test@example.com');

    // Assert
    // ... assertions here ...

    // Capture ID for cleanup
    await usersApi.getAll({ params: { email: 'test@example.com' } });
    const users = usersApi.getLastBody<UserListResponse>();
    createdUserId = users.users[0]?.id ?? null;
  } finally {
    // Cleanup via API (fast, reliable)
    if (createdUserId) {
      await usersApi.remove(createdUserId);
    }
  }
});
```

## Test Construction Rules

```typescript
// Hybrid tests destructure BOTH fixtures
test('hybrid test', async ({ browser_interface, api_client }) => {
  // Arrange — create instances that need both
  const tasks = new HybridTasks(api_client, browser_interface);
  const usersApi = new UsersApi(api_client);  // For assertions

  // Act — ONE task method
  await tasks.seedUserAndVerifyInUI('John', 'john@test.com');

  // Assert — mix of POM and Api Object state-check methods
  expect(await usersPage.isUserDisplayed('John')).toBe(true);  // UI
  expect(usersApi.isLastStatusOk()).toBe(true);                  // API
});
```

## Anti-Patterns

```typescript
// NEVER — mixing API and UI in the test body directly
await api_client.post('/api/users', { data: { name: 'John' } });  // ✗
await browser_interface.navigateTo('/users');                       // ✗
// Always compose through Tasks

// NEVER — using API to bypass UI test intent
// If the test is "user can create account via form", don't seed via API
// API seeding is for prerequisite data, not the action under test
```

---

*Seeded from Playwright hybrid testing patterns and framework architecture conventions.*
