# Isagawa QA Platform (TypeScript/Playwright)

[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/playwright-latest-green.svg)](https://playwright.dev/)
[![MCP](https://img.shields.io/badge/MCP-enabled-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-grade TypeScript Playwright framework with **AI-powered test generation**. Describe what you want to test in plain English, and AI generates complete, maintainable test automation code — for **UI**, **API**, and **hybrid** tests.

---

## Get Started (Step by Step)

Follow each step in order. Do not skip any step. Everything is done inside VS Code.

### Step 1: Install VS Code

VS Code is the code editor where you will do all your work.

1. Go to https://code.visualstudio.com/
2. Click the big **Download** button
3. Open the file you downloaded
4. Follow the installer — click **Next** on each screen, then click **Install**
5. When it finishes, open VS Code

### Step 2: Install Git

Git is a tool that downloads and tracks code. You need it to download this project.

1. Go to https://git-scm.com/downloads
2. Click the download for your operating system (Windows, Mac, or Linux)
3. Open the file you downloaded
4. Follow the installer — use the default options on every screen, click **Next**, then **Install**
5. When it finishes, restart VS Code if it is already open

**Check that Git is installed:**
1. In VS Code, open the terminal: press ``Ctrl + ` `` (the backtick key, above the Tab key on your keyboard)
2. Type this and press **Enter**:
   ```bash
   git --version
   ```
3. You should see something like: `git version 2.44.0`. If you see this, Git is installed.

### Step 3: Install Node.js

Node.js runs the test framework. You need it to install and run tests.

1. Go to https://nodejs.org/
2. Click the **LTS** download button (the one that says "Recommended")
3. Open the file you downloaded
4. Follow the installer — use the default options, click **Next**, then **Install**
5. Restart VS Code after installing

**Check that Node.js is installed:**
1. In the VS Code terminal (``Ctrl + ` ``), type:
   ```bash
   node --version
   ```
2. You should see something like: `v20.11.0`. The number must be 18 or higher.

### Step 4: Install Claude Code Extension

Claude Code is the AI agent that builds tests for you inside VS Code.

1. In VS Code, click the **Extensions** icon on the left sidebar (it looks like 4 small squares)
2. In the search box, type: `Claude Code`
3. Find **"Claude Code"** by Anthropic — click **Install**
4. Wait for the install to finish
5. You will see a **sparkle icon (✱)** appear in the top-right area of VS Code

> **You need an Anthropic account.** If you do not have one, go to https://claude.ai and create an account first.

### Step 5: Download This Project

Do this inside VS Code. Do not use a separate terminal.

1. In VS Code, open the terminal: press ``Ctrl + ` ``
2. Go to your Desktop (so the project saves there):
   ```bash
   cd Desktop
   ```
3. Download the project:
   ```bash
   git clone https://github.com/isagawa-qa/platform-playwright.git
   ```
4. Wait for the download to finish

### Step 6: Open the Project in VS Code

This step is important. Claude Code needs to be inside the project folder to work correctly.

1. In VS Code, click **File** → **Open Folder**
2. Find and select the `platform-playwright` folder on your Desktop
3. Click **Select Folder** (Windows) or **Open** (Mac)
4. VS Code will reload with the project open
5. You should see the project files on the left sidebar (folders like `framework/`, `tests/`, `.claude/`)

### Step 7: Install Dependencies

1. In VS Code, open the terminal: press ``Ctrl + ` ``
2. Type this command and press **Enter**:
   ```bash
   npm install
   ```
3. Wait for it to finish (you will see the cursor return)
4. Then type this command and press **Enter**:
   ```bash
   npx playwright install chromium
   ```
5. Wait for it to finish

### Step 8: Verify Playwright MCP

The AI agent uses Playwright MCP to open a browser and discover page elements.

1. In Claude Code, type:
   ```
   /mcp
   ```
2. You should see **playwright** in the list of MCP servers
3. If you do NOT see it, close VS Code and open it again, then check `/mcp` again

### Step 9: Verify the Install

In the VS Code terminal (``Ctrl + ` ``), type:
```bash
npx playwright test
```

You should see: **2 passed**. This means everything is installed correctly.

If you see errors, go to the [Troubleshooting](#troubleshooting) section below.

### Step 10: Create Your First Test

1. In Claude Code (click the **sparkle icon ✱** if it is not open), type:
   ```
   /qa-workflow
   ```
2. Claude will ask what you want to test. Use this format for best results:

   ```
   Requirement: As a [role], I want to [action] so I can [goal]
   URL: https://your-app.com/page1, https://your-app.com/page2
   Workflows: workflow-name

   ---
   Steps:

   Phase 1: [Description]
   1. [Action] → [Expected result]
   2. [Action] → [Expected result]
   3. [Action] → [Expected result]

   Phase 2: [Description]
   4. [Action] → [Expected result]
   5. [Action] → [Expected result]

   Expected:
   - [What should happen after Phase 1]
   - [What should happen after Phase 2]

   Credentials:
   - Email: your-test-email@example.com
   - Password: your-test-password
   ```

   **Example (real test):**

   ```
   Requirement: As an employee manager, I want to create an employee
     and assign them a task so I can validate the workforce management flow
   URL: https://myapp.com/employees, https://myapp.com/tasks
   Workflows: employee-management and task-management

   ---
   Steps:

   Phase 1: Create employee
   1. Login with credentials → redirects to /dashboard
   2. Click "Employees" in sidebar → opens /employees
   3. Click "Add Employee" button → modal opens
   4. Enter name: "Research Assistant"
   5. Configure employee settings (role, capabilities)
   6. Click "Create Employee" → modal closes

   Phase 2: Assign task to employee
   7. Click "Tasks" in sidebar → opens /tasks
   8. Click "Add Task" button → modal opens
   9. Enter title: "Research competitor pricing"
   10. Enter description: "Analyze top 5 competitors"
   11. Select assignee: "Research Assistant" from dropdown
   12. Click "Create Task" → modal closes

   Expected:
   - Toast: "Employee created" after step 6
   - "Research Assistant" appears in employees list
   - Toast: "Task created" after step 12
   - Task shows "Research Assistant" as assignee

   Credentials:
   - Email: testuser@example.com
   - Password: testpassword123
   ```

3. Press **Enter** and wait. Claude will:
   - Open a browser and navigate to your URL
   - Find all the buttons, fields, and links on each page
   - Write the test code automatically
   - Save the files in the correct folders
   - Run the test

4. When it finishes, you will see the test result: **passed** or **failed**

### Step 11: Review the Code Quality

After Claude creates the test, run a code review to fix any pattern issues:

1. In Claude Code, type:
   ```
   /pr
   ```
2. Claude will scan all generated files and check them against the framework's coding standards
3. If everything is correct, you will see: **PR REVIEW: APPROVED**
4. If there are issues, Claude will show you what is wrong and ask how you want to fix them. Choose **Option 1 (Fix all)** to let Claude fix the issues automatically.

> **Always run `/pr` after creating tests.** This ensures your test code follows the correct architecture patterns.

### Step 12: Create More Tests

Repeat Steps 10-11 with different requirements for your application.

> **Tip:** The more detail you put in your requirement (steps, expected results, URLs), the better the generated test will be. Vague requirements produce vague tests.

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
