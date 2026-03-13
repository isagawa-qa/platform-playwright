# Isagawa QA Platform (TypeScript/Playwright)

[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/playwright-latest-green.svg)](https://playwright.dev/)
[![MCP](https://img.shields.io/badge/MCP-enabled-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-grade TypeScript Playwright framework with **AI-powered test generation**. Describe what you want to test in plain English, and AI generates complete, maintainable test automation code — for **UI**, **API**, and **hybrid** tests.

---

## What You Get

- **AI generates tests from requirements** — Describe a user story, get working test code
- **Production-grade architecture** — 5-layer pattern (Role > Task > Page/Api Object > BrowserInterface/ApiClient) that scales
- **Three test types** — UI (browser), API (HTTP), and hybrid (both) from a single framework
- **Consistent code patterns** — Every generated test follows the same structure
- **Self-improving AI** — The Isagawa Kernel enforces patterns and learns from every failure
- **Works with your AI tool** — Claude Code, Cursor, Windsurf, or any MCP-compatible agent

---

## How It Works

```
1. You describe: "As a standard user, I want to login and view inventory"
2. AI discovers page elements automatically (via Playwright MCP)
3. AI generates: Page Objects, Api Objects, Tasks, Roles, and Tests
4. You run: npx playwright test tests/your-workflow/
```

The generated code follows strict architectural patterns — no spaghetti, no "every engineer writes it differently" problems.

---

## Prerequisites

Before installing, ensure you have:

| Requirement | Version | Check Command | Download |
|-------------|---------|---------------|----------|
| Node.js | 18+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| Git | Any | `git --version` | [git-scm.com](https://git-scm.com/) |
| MCP-compatible AI | - | - | Claude Code, Cursor, or Windsurf |

### AI Agent Options

This framework requires an MCP-compatible AI coding agent:

| Agent | MCP Support | Notes |
|-------|-------------|-------|
| [Claude Code](https://claude.ai/download) | Native | Recommended — best MCP integration |
| [Cursor](https://cursor.sh/) | Via config | Requires MCP configuration |
| [Windsurf](https://codeium.com/windsurf) | Via config | Requires MCP configuration |

---

## Installation

### Step 1: Clone and Install

```bash
git clone https://github.com/isagawa-qa/platform-playwright.git
cd platform-playwright
npm install
npx playwright install chromium
```

### Step 2: Verify Installation

```bash
# Run reference tests
npx playwright test

# Two reference tests should pass — this confirms the framework is working
```

### Step 3: MCP Configuration

The framework uses the Playwright MCP server for element discovery. Create or verify `.mcp.json` in the project root:

**Windows:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@playwright/mcp@latest"]
    }
  }
}
```

**macOS / Linux:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### Step 4: Verify MCP

In your AI agent, ask:
```
What MCP tools are available?
```

You should see tools like:
- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_snapshot`
- `mcp__playwright__browser_click`

---

## Quick Start: Generate Your First Test

### Option A: Use the Workflow Command (Recommended)

In Claude Code, run:
```
/qa-workflow
```

Then provide your requirement:
```
As a standard user, I want to login on https://www.saucedemo.com
```

The AI will:
1. Navigate to the site and discover elements
2. Generate Page Objects, Tasks, Roles, and Tests
3. Save files to the correct locations
4. Run the test

### Option B: API Test

```
/qa-workflow
```

```
As an API consumer, I want to create and retrieve users via POST /api/users and GET /api/users/{id}
```

The AI generates Api Objects, API Tasks, and API Tests — same architecture, HTTP instead of browser.

### Option C: Hybrid Test

```
/qa-workflow
```

```
As an admin, I want to create a user via API then verify they appear in the UI
```

The AI generates both Api Objects and Page Objects, with hybrid Tasks that compose both.

---

## Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test tests/auth-login/test-login.spec.ts
```

### Run Headed (See Browser)
```bash
npx playwright test --headed
```

### Run with HTML Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## Architecture: The 5-Layer Pattern

Generated code follows a strict 5-layer architecture supporting UI, API, and hybrid tests:

```
┌─────────────────────────────────────────────────────────────┐
│  TEST                                                       │
│  • Arrange, Act, Assert                                     │
│  • Calls ONE role method                                    │
│  • Asserts via POM / Api Object state-check methods         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ROLE                                                       │
│  • User personas (StandardUser, ApiConsumer)                 │
│  • Orchestrates multiple tasks into workflows               │
│  • Example: login → browse → add to cart → checkout         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  TASK                                                       │
│  • Single business operations (login, createUser)           │
│  • Composes Page Objects, Api Objects, or both              │
│  • Domain-focused, not UI/API-focused                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PAGE OBJECT / API OBJECT                                   │
│  • One class per page or API resource                       │
│  • Contains all locators (POM) or endpoint paths (API)      │
│  • Atomic methods: click, fill, create, getById             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BROWSER INTERFACE / API CLIENT                             │
│  • Playwright wrappers                                      │
│  • BrowserInterface: Page interactions, waits, screenshots  │
│  • ApiClient: HTTP methods, auth tokens, response parsing   │
└─────────────────────────────────────────────────────────────┘
```

### Three Test Paths

```
UI Path:   Test → Role → Task → Page Object  → BrowserInterface → Browser
API Path:  Test → Role → Task → Api Object   → ApiClient        → HTTP
Hybrid:    Test → Role → Task → POM + ApiObj  → BI + ApiClient
```

### Why This Matters

| Problem | How This Framework Solves It |
|---------|------------------------------|
| UI changes break tests | Locators in ONE place (Page Objects) |
| API contract changes break tests | Endpoints in ONE place (Api Objects) |
| Tests are hard to read | Tests only assert, logic is in Roles/Tasks |
| Code duplication | Tasks are reusable across tests |
| Different coding styles | AI generates consistent patterns |
| Hard to onboard new team members | Clear layer separation, same patterns everywhere |

### Golden Rules

```
1. Locators ONLY in Page Objects (static readonly)
2. Endpoint paths ONLY in Api Objects (static readonly)
3. Tasks/Roles return void — never return values
4. Tests assert via POM state-check methods (UI) or Api Object state-check methods (API)
5. No inheritance — composition only
6. One responsibility per layer
```

---

## Project Structure

```
platform-playwright/
├── framework/
│   ├── _reference/              # Canonical patterns (read-before-write)
│   │   ├── pages/               # POM reference implementations
│   │   ├── apis/                # Api Object reference implementations
│   │   ├── tasks/               # Task references (UI, API, hybrid)
│   │   ├── roles/               # Role reference implementations
│   │   └── tests/               # Test references (UI + API)
│   ├── interfaces/
│   │   ├── browser-interface.ts # Playwright Page wrapper (UI)
│   │   └── api-client.ts        # Playwright APIRequestContext wrapper (API)
│   ├── utilities/
│   │   ├── autologger.ts        # Method logging decorator
│   │   ├── logger.ts            # Winston logger
│   │   └── data-generator.ts    # Faker-based test data
│   ├── pages/                   # Generated Page Objects (by workflow)
│   │   └── {workflow}/
│   ├── apis/                    # Generated Api Objects (by workflow)
│   │   └── {workflow}/
│   ├── tasks/                   # Generated Tasks (by workflow)
│   │   └── {workflow}/
│   └── roles/                   # Generated Roles (by workflow)
│       └── {workflow}/
│
├── tests/
│   ├── fixtures/
│   │   └── index.ts             # Playwright fixtures (browser_interface, api_client)
│   ├── data/                    # Test data (credentials, fixtures)
│   │   └── test_users.json
│   └── {workflow}/              # Generated tests (by workflow)
│
├── .claude/
│   ├── commands/                # Kernel + QA workflow commands
│   │   └── kernel/              # Kernel governance commands
│   ├── hooks/                   # Gate enforcer + test failure detector
│   ├── skills/
│   │   ├── kernel-domain-setup/ # Self-building kernel setup
│   │   ├── qa-management-layer/ # 5-step QA workflow skill
│   │   └── autonomous-cycling/  # Autonomous task cycling
│   └── settings.json
│
├── .mcp.json                    # Playwright MCP server config
├── playwright.config.ts
├── CLAUDE.md                    # Kernel instructions
├── FRAMEWORK.md                 # Full architecture reference
├── package.json
├── tsconfig.json
└── LICENSE
```

---

## Configuration

### Environment Variables

Create a `.env` file with your application URL:

```
BASE_URL=https://staging.your-app.com
API_BASE_URL=https://api.staging.your-app.com
LOG_LEVEL=info
SCREENSHOT_DIR=screenshots
```

### Test Users

Edit `tests/data/test_users.json`:

```json
{
  "standard_user": {
    "username": "your-test-user",
    "password": "your-test-password"
  }
}
```

---

## Test Data Strategies

When generating tests that require credentials, you have three options:

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Static** | Use existing account from `tests/data/test_users.json` | Login-only tests |
| **Dynamic** | Register fresh user, save for later tests | Registration flows |
| **Self-contained** | Register and use within same test | Independent tests |

For API tests, you also choose an authentication strategy:

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Bearer token** | Token set via `ApiClient.setAuthToken()` | Token-based APIs |
| **API key** | Key sent in default headers | API key auth |
| **Session cookie** | Shared auth state with browser context | Hybrid tests |
| **None** | Public API, no auth required | Public endpoints |

Tell the AI which strategy you want when providing your requirement.

---

## Workflow Naming

To avoid overwriting files from previous test runs, use unique workflow names:

```
# First test
workflow: "auth-login"

# Subsequent tests
workflow: "checkout-v1"
workflow: "user-management"
workflow: "order-api"
```

Files are generated in:
- `framework/pages/{workflow}/`
- `framework/apis/{workflow}/`
- `framework/tasks/{workflow}/`
- `framework/roles/{workflow}/`
- `tests/{workflow}/`

---

## Troubleshooting

### Playwright MCP Not Working

**Symptom:** Element discovery fails, browser doesn't open

**Solutions:**
1. Install Playwright browser:
   ```bash
   npx playwright install chromium
   ```

2. Test Playwright MCP manually:
   ```bash
   npx -y @playwright/mcp@latest
   ```

3. Windows users: Ensure using `cmd /c npx` in `.mcp.json`

### Element Not Found / Timeout

**Symptom:** `TimeoutError` during test run

**Solutions:**
1. Check if target website is accessible
2. Verify locators match current page structure
3. Run headed to see what's happening: `npx playwright test --headed`

### Import Errors

**Symptom:** `Cannot find module` when running tests

**Solutions:**
1. Reinstall dependencies:
   ```bash
   npm install
   ```

2. Check `tsconfig.json` paths are correct

---

## Reference Implementation

The `framework/_reference/` directory contains canonical TypeScript/Playwright patterns for each layer. The AI reads these before generating any code.

| Layer | Reference File | Type |
|-------|----------------|------|
| Page Object | `framework/_reference/pages/login-page.ts` | UI |
| Api Object | `framework/_reference/apis/users-api.ts` | API |
| Task (UI) | `framework/_reference/tasks/reference-tasks.ts` | UI |
| Task (API/Hybrid) | `framework/_reference/tasks/reference-api-tasks.ts` | API, Hybrid |
| Role | `framework/_reference/roles/reference-role.ts` | All |
| Test (UI) | `framework/_reference/tests/test-reference-workflow.spec.ts` | UI |
| Test (API/Hybrid) | `framework/_reference/tests/test-reference-api-workflow.spec.ts` | API, Hybrid |

See `FRAMEWORK.md` for the complete architecture reference.

---

## For Manual Testers: Your Learning Path

New to automation? Here's how this maps to manual testing:

| Manual Testing | Framework Layer |
|---------------|-----------------|
| "I'm testing as a guest user" | Role (GuestUser) |
| "I need to browse products" | Task (browseCategory) |
| "I click the login button" | Page Object (clickLogin method) |
| "I call the create user API" | Api Object (create method) |
| "I verify products are displayed" | Test (assertion via state-check) |

### Read a Simple Test

```typescript
test('successful login', async ({ browser_interface }) => {
  // Arrange - Set up
  const user = new StandardUserRole(browser_interface);
  const loginPage = new LoginPage(browser_interface);

  // Act - Do the action
  await user.loginAndViewInventory('standard_user', 'secret_sauce');

  // Assert - Verify result
  expect(await loginPage.isLoggedIn()).toBe(true);
});
```

The test reads like a user story.

---

## Also Available

**Selenium/Python edition:** [github.com/isagawa-qa/platform-selenium](https://github.com/isagawa-qa/platform-selenium)

Same architecture, same management loop — different tech stack.

---

## Services

We deliver a highly scalable, maintainable, enterprise-grade test automation framework powered by an AI agent managed by our own enforcement kernel. We build the entire test solution: login credentials, data management, environment configuration, and page object architecture. Your team owns the entire tech stack.

### Demo

We'll build working tests on **YOUR** site in 60 minutes. No discovery phase. No proposal. No waiting.

**[alain@isagawa.co](mailto:alain@isagawa.co)** · **[DM on LinkedIn](https://www.linkedin.com/in/alain-ignacio-54b9823)**

### Pricing

| Offering | What's Included | Price |
|----------|----------------|-------|
| **Demo** | Live 60-min session on your site | Contact us |
| **Implementation** | Full QA infrastructure: framework setup, credential management, environment config, team training | $15,000 – $50,000 |
| **Retainer** | Ongoing test development, maintenance, new workflow coverage, priority support | $1,000 – $3,000/month |
| **Enterprise** | Full implementation, compliance docs, dedicated support | Custom ($50K+) |

---

## Support

- **Issues:** [GitHub Issues](https://github.com/isagawa-qa/platform-playwright/issues)
- **Architecture Details:** See `FRAMEWORK.md`

---

## License

[MIT](LICENSE) — Copyright (c) 2025 Isagawa

---

<sub>Built with the [Isagawa Kernel](https://github.com/isagawa-co/isagawa-kernel) — self-building, self-improving, safety-first.</sub>
