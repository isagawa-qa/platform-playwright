---
step: 4
title: Discovery and Construction
gate: validate-construction
next: step-05
---

# Step 4: Element Discovery + Collaborative Construction

**Purpose:** Discover interactive elements on target page, then build all 5 layers.

---

## Identity & Flow

| Field | Value |
|-------|-------|
| **Step** | 4 - Element Discovery + Construction |
| **Dependencies** | Step 3 complete (bdd_scenarios, expected_states, intent) |
| **Input** | URL from Step 1, credential_strategy from Step 2, metadata from Step 3 |
| **Output** | Complete test code: POMs and/or Api Objects, Tasks, Roles, Tests |

---

## Discovery Phase

Discovery depends on `test_type` from Step 1:

| Test Type | Discovery Method |
|-----------|-----------------|
| **UI** | Element discovery via Playwright MCP (existing flow) |
| **API** | Endpoint discovery from user input or OpenAPI spec |
| **Hybrid** | Both element discovery AND endpoint discovery |

---

## Endpoint Discovery (API and Hybrid)

For API and hybrid tests, discover endpoints before construction:

```
ACTION:
- READ endpoints from Step 1 state
- For each endpoint:
  - IDENTIFY HTTP method (GET, POST, PUT, PATCH, DELETE)
  - IDENTIFY path parameters (e.g., {id})
  - IDENTIFY request body shape (from user description or OpenAPI spec)
  - IDENTIFY expected response shape
- GROUP endpoints by resource (e.g., all /api/users/* → UsersApi)

IF user provided an OpenAPI/Swagger spec path:
  - READ the spec file
  - EXTRACT endpoints, request/response schemas, auth requirements
  - Use as authoritative source for Api Object construction

IF no spec provided:
  - Use endpoint list from Step 1
  - ASK user for request/response shapes if unclear
  - Do NOT guess API shapes — ask the user
```

---

## Element Discovery (Playwright MCP) — UI and Hybrid

**Method:** Use the Playwright MCP server for element discovery.

The Playwright MCP provides browser tools that let the agent navigate pages, inspect the accessibility tree, and extract selectors. It is configured in `.mcp.json` (project root) and loads at Claude Code startup.

### MANDATORY: Verify MCP Tools Are Available

**Before attempting ANY element discovery, verify that Playwright MCP tools are loaded in this session.**

Check for MCP tools with names like `mcp__playwright__*` (e.g., `browser_navigate`, `browser_snapshot`, `browser_click`). These are the tools you use for discovery.

**If MCP tools are NOT available:**

```
BLOCKED: Playwright MCP tools not available

The Playwright MCP server did not load in this session.
Element discovery requires MCP browser tools to inspect pages.

Possible causes:
1. Claude Code was not restarted after MCP was configured
2. .mcp.json (project root) is missing or misconfigured
3. .claude/settings.local.json is missing enableAllProjectMcpServers

FIX:
1. Check .mcp.json (project root) has playwright server config
2. Check .claude/settings.local.json has enableAllProjectMcpServers: true
3. Restart Claude Code
4. Re-run /qa-workflow
```

**STOP. Do NOT fall back to WebFetch. Do NOT guess selectors. Do NOT proceed without MCP.**

The entire point of element discovery is to inspect the LIVE page via MCP. Guessing selectors defeats the purpose and produces broken tests.

---

### AI Discovery Flow (for each page in workflow)

1. NAVIGATE to target URL using Playwright MCP browser tools
2. INSPECT page structure via:
   - Accessibility tree snapshot (MCP `browser_snapshot` tool)
   - Page content inspection
3. EXTRACT relevant elements:
   - Inputs, buttons, links, selects, textareas
   - Confirmation/error messages (output elements)
4. BUILD elements array in standard format:
   ```json
   {
     "name": "USERNAME_INPUT",
     "type": "textbox",
     "selector": "#user-name"
   }
   ```

---

## HITL Rule: STOP on ANY Failure

When ANY failure occurs during discovery:
1. **STOP** - Do not attempt autonomous fixes
2. **REPORT** - Show user exactly what failed
3. **WAIT** - Get human decision before proceeding

**This includes MCP tools not being available. Never work around missing MCP.**

---

## Pre-Construction Checkpoint (MANDATORY)

**Before writing ANY code, invoke the pre-construction checkpoint:**

Read and follow: `.claude/skills/qa-management-layer/checkpoints/pre-construction.md`

This ensures:
- Reuse check (scan for duplicate modules across workflows)
- Lessons learned are read and applied
- Reference files are read (not from memory)
- BrowserInterface methods are checked (UI/hybrid)
- ApiClient methods are checked (API/hybrid)
- Reference Api Objects are read (API/hybrid)

**Do not skip this checkpoint.**

---

## Multi-Page Workflows

If the workflow spans multiple pages (login → inventory → cart → checkout), read the extended guide:

→ `steps/step-04-multipage.md`

---

## Collaborative Construction

After element discovery, AI builds each layer using Edit/Write tools:

### Build Order

Build order depends on `test_type`:

**UI tests:**
```
1. Page Objects   → framework/pages/{workflow}/{page-name}-page.ts
2. Tasks          → framework/tasks/{workflow}/{workflow}-tasks.ts
3. Roles          → framework/roles/{workflow}/{role-name}-role.ts
4. Tests          → tests/{workflow}/test-{name}.spec.ts
```

**API tests:**
```
1. Api Objects    → framework/apis/{workflow}/{resource-name}-api.ts
2. Tasks          → framework/tasks/{workflow}/{workflow}-api-tasks.ts
3. Roles          → framework/roles/{workflow}/{role-name}-role.ts
4. Tests          → tests/{workflow}/test-{name}-api.spec.ts
```

**Hybrid tests:**
```
1. Page Objects   → framework/pages/{workflow}/{page-name}-page.ts
2. Api Objects    → framework/apis/{workflow}/{resource-name}-api.ts
3. Tasks          → framework/tasks/{workflow}/{workflow}-tasks.ts (compose both)
4. Roles          → framework/roles/{workflow}/{role-name}-role.ts
5. Tests          → tests/{workflow}/test-{name}.spec.ts
```

### Layer Validation (must pass before proceeding)

| Layer | Check |
|-------|-------|
| **POM** | Static locators, atomic methods return `this`, state-check methods |
| **Api Object** | Static endpoint constants, atomic methods return `this`, state-check methods, typed request/response |
| **Task** | `@autologger('Task')`, POM/Api Object composition, void return, no locators/URLs |
| **Role** | `@autologger('Role')`, Task composition, void return, no locators/URLs |
| **Test** | `test()`, `expect()`, Role workflow calls, POM/Api Object assertions |

### Reference Files (AI MUST read before generating)

| Layer | Read First | When |
|-------|------------|------|
| POM | `framework/_reference/pages/login-page.ts` | UI, Hybrid |
| Api Object | `framework/_reference/apis/users-api.ts` | API, Hybrid |
| Task (UI) | `framework/_reference/tasks/reference-tasks.ts` | UI |
| Task (API/Hybrid) | `framework/_reference/tasks/reference-api-tasks.ts` | API, Hybrid |
| Role | `framework/_reference/roles/reference-role.ts` | All |
| Test (UI) | `framework/_reference/tests/test-reference-workflow.spec.ts` | UI |
| Test (API/Hybrid) | `framework/_reference/tests/test-reference-api-workflow.spec.ts` | API, Hybrid |

---

## TypeScript/Playwright Patterns

### POM Pattern

```typescript
import { BrowserInterface } from '../../interfaces/browser-interface';

export class LoginPage {
  constructor(private readonly browser: BrowserInterface) {}

  // Locators as static readonly constants
  static readonly USERNAME_INPUT = '#user-name';
  static readonly PASSWORD_INPUT = '#password';

  // Atomic methods return this
  async enterUsername(username: string): Promise<LoginPage> {
    await this.browser.fill(LoginPage.USERNAME_INPUT, username);
    return this;
  }

  // State-check methods return boolean/string
  async isLoggedIn(): Promise<boolean> {
    return await this.browser.isElementVisible('.inventory_list', 5000);
  }
}
```

### Api Object Pattern (API and Hybrid)

```typescript
import { ApiClient, ApiResponseData } from '../../interfaces/api-client';

interface CreateUserRequest { name: string; email: string; }
interface UserResponse { id: number; name: string; email: string; }

export class UsersApi {
  private lastResponse: ApiResponseData | null = null;

  constructor(private readonly api: ApiClient) {}

  static readonly BASE_PATH = '/api/users';
  static readonly SINGLE_PATH = (id: number) => `/api/users/${id}`;

  async create(data: CreateUserRequest): Promise<UsersApi> {
    this.lastResponse = await this.api.post<UserResponse>(UsersApi.BASE_PATH, { data });
    return this;
  }

  getLastStatus(): number {
    if (!this.lastResponse) throw new Error('No API call has been made yet');
    return this.lastResponse.status;
  }

  getLastBody<T = unknown>(): T {
    if (!this.lastResponse) throw new Error('No API call has been made yet');
    return this.lastResponse.body as T;
  }
}
```

### Task Pattern (UI)

```typescript
import { BrowserInterface } from '../../interfaces/browser-interface';
import { autologger } from '../../utilities/autologger';
import { LoginPage } from '../pages/login-page';

export class LoginTasks {
  private readonly loginPage: LoginPage;

  constructor(browser: BrowserInterface) {
    this.loginPage = new LoginPage(browser);
  }

  @autologger('Task')
  async loginAsUser(username: string, password: string): Promise<void> {
    await (await this.loginPage.navigate())
      .enterUsername(username);
    await this.loginPage.enterPassword(password);
    await this.loginPage.clickLogin();
    // NO return
  }
}
```

### Task Pattern (API)

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
  async createUser(name: string, email: string): Promise<void> {
    await this.usersApi.create({ name, email });
    // NO return
  }
}
```

### Role Pattern

```typescript
import { BrowserInterface } from '../../interfaces/browser-interface';
import { autologger } from '../../utilities/autologger';
import { LoginTasks } from '../tasks/login-tasks';

export class StandardUserRole {
  private readonly tasks: LoginTasks;

  constructor(browser: BrowserInterface) {
    this.tasks = new LoginTasks(browser);
  }

  @autologger('Role')
  async loginAndBrowse(username: string, password: string): Promise<void> {
    await this.tasks.loginAsUser(username, password);
    // NO return
  }
}
```

### Test Pattern (UI)

```typescript
import { test, expect } from '../../fixtures';
import { StandardUserRole } from '../../../framework/roles/auth/standard-user-role';
import { LoginPage } from '../../../framework/pages/auth/login-page';

test.describe('Standard User Login', () => {
  test('successful login', async ({ browser_interface }) => {
    // Arrange
    const user = new StandardUserRole(browser_interface);
    const loginPage = new LoginPage(browser_interface);

    // Act
    await user.loginAndBrowse('standard_user', 'secret_sauce');

    // Assert - Via POM state-check methods
    expect(await loginPage.isLoggedIn()).toBe(true);
  });
});
```

### Test Pattern (API)

```typescript
import { test, expect } from '../../fixtures';
import { UsersApi } from '../../../framework/apis/users/users-api';

test.describe('User API', () => {
  test('create a new user', async ({ api_client }) => {
    // Arrange
    const usersApi = new UsersApi(api_client);

    // Act
    await usersApi.create({ name: 'John', email: 'john@test.com' });

    // Assert - Via Api Object state-check methods
    expect(usersApi.getLastStatus()).toBe(201);
    expect(usersApi.isLastStatusOk()).toBe(true);
  });
});
```

---

## State Schema

```json
{
  "step": 4,
  "status": "complete",
  "data": {
    "pages_created": ["LoginPage", "InventoryPage"],
    "apis_created": ["UsersApi"],
    "tasks_created": ["AuthTasks", "UserApiTasks"],
    "roles_created": ["StandardUserRole"],
    "tests_created": ["test-login.spec.ts", "test-users-api.spec.ts"],
    "discovered_elements": {
      "LoginPage": [
        {"name": "USERNAME_INPUT", "type": "textbox", "selector": "#user-name"}
      ]
    },
    "discovered_endpoints": {
      "UsersApi": [
        {"method": "POST", "path": "/api/users", "request": "CreateUserRequest"},
        {"method": "GET", "path": "/api/users/{id}", "response": "UserResponse"}
      ]
    }
  }
}
```

---

*Next: Step 5 - Test Execution + HITL Iteration*
