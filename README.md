# Isagawa QA Platform (Playwright)

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![TypeScript 5.7+](https://img.shields.io/badge/TypeScript-5.7%2B-blue.svg)](https://www.typescriptlang.org/)
[![Playwright 1.50+](https://img.shields.io/badge/Playwright-1.50%2B-green.svg)](https://playwright.dev/)

Automated test generation and execution for web applications. An AI agent discovers page elements and API endpoints, generates structured test code across a 5-layer architecture, and runs UI, API, and hybrid tests. Describe what you want to test in plain English. The agent builds the rest.

Built on the [Isagawa Kernel](https://github.com/isagawa-co/isagawa-kernel).

## The Problem

QA automation on web applications breaks down in predictable ways. Locators are scattered across test files. API endpoints are duplicated. Every engineer writes tests differently. When the UI changes, dozens of tests break. When the API contract changes, nobody knows which tests are affected. AI-generated test code makes it worse because there is no enforcement keeping the generated code on pattern.

The result is a test suite that is expensive to maintain, unreliable to run, and impossible to hand off.

## The Solution

The Playwright Platform replaces that with a structured, repeatable framework. An AI agent reads your requirement, discovers the target application via Playwright MCP, and generates test code across five layers with strict separation of concerns. The agent operates under kernel enforcement, which means it cannot skip layers, mix locators into test files, or drift from the architecture pattern.

Three test paths (UI, API, hybrid) share the same architecture. Locators live in one place. Endpoints live in one place. Business logic lives in Tasks and Roles. Tests only assert.

## How It Works

The generation pipeline runs in five steps:

1. **Input.** Provide a requirement: user story, target URLs, and test steps.
2. **Discovery.** The agent navigates to each URL via Playwright MCP and captures page elements and API endpoints.
3. **Generation.** The agent produces Page Objects, Api Objects, Tasks, Roles, and Tests following the reference implementations.
4. **Execution.** Tests run via `npx playwright test` against the target application.
5. **Review.** The `/pr` command validates generated code against architecture patterns.

```
Requirement: "As a standard user, I want to login and add items to my cart"

LoginPage       → enterUsername(), enterPassword(), clickLogin()
InventoryPage   → addItemToCart(), getCartCount()
CartPage        → verifyItemInCart()
ReferenceTasks  → login(), addToCart()
ReferenceRole   → loginAndPurchase()
Test            → assert cart contains expected item
```

## Architecture

Every generated file follows a 5-layer separation of concerns. Each layer has a single responsibility. The architecture supports three test paths: UI (browser), API (HTTP), and hybrid (both).

| Layer | Responsibility | Reference |
|-------|---------------|-----------|
| BrowserInterface / ApiClient | Playwright Page and APIRequestContext wrappers | `framework/interfaces/` |
| Page Object / Api Object | Locators or endpoint paths as static readonly, atomic methods, return this | `framework/_reference/pages/`, `apis/` |
| Task | Single domain operation, composes POMs and/or ApiObjs, @autologger | `framework/_reference/tasks/` |
| Role | User workflows, composes Tasks, @autologger | `framework/_reference/roles/` |
| Test | Playwright test specs, AAA pattern, assert via state-check methods | `framework/_reference/tests/` |

```
UI Path:     Test > Role > Task > Page Object  > BrowserInterface > Browser
API Path:    Test > Role > Task > Api Object   > ApiClient        > HTTP
Hybrid:      Test > Role > Task > POM + ApiObj > BI + ApiClient
```

Reference implementations ship in `framework/_reference/`:

| Layer | File | Type |
|-------|------|------|
| Page Object | `pages/login-page.ts`, `inventory-page.ts`, `cart-page.ts`, `checkout-page.ts` | UI |
| Api Object | `apis/users-api.ts` | API |
| Task (UI) | `tasks/reference-tasks.ts` | UI |
| Task (API) | `tasks/reference-api-tasks.ts` | API, Hybrid |
| Role | `roles/reference-role.ts` | All |
| Test (UI) | `tests/test-reference-workflow.spec.ts` | UI |
| Test (API) | `tests/test-reference-api-workflow.spec.ts` | API, Hybrid |

## Kernel Enforcement

The Playwright Platform includes a domain spec that teaches the AI agent how to generate and validate test code. The Isagawa Kernel enforces these rules at runtime:

- Locators exist only in Page Objects. The agent never puts selectors in Tasks, Roles, or Tests.
- Endpoint paths exist only in Api Objects. The agent never hardcodes URLs in Tasks or Tests.
- Tasks and Roles return void. They never return values.
- Tests assert via state-check methods on Page Objects or Api Objects, not by inspecting raw DOM or response data.
- No inheritance. Composition only, at every layer.
- The agent reads reference implementations before generating any code. It cannot skip this step.

The agent learns from failures and updates its approach permanently through the kernel's lesson system.

## Quick Start

### Prerequisites

Node.js 18 or later, [Claude Code](https://claude.ai/claude-code), and a target web application to test against.

### Install

```bash
git clone https://github.com/isagawa-qa/platform-playwright.git
cd platform-playwright
npm install
npx playwright install chromium
```

### Configure

Verify Playwright MCP is available. The `.mcp.json` in the project root configures the MCP server:

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

### Run

```bash
claude          # Start Claude Code in the project directory
/qa-workflow    # Generate and run tests from a requirement
```

The agent handles the rest: element discovery, code generation across all five layers, test execution, and structured reporting.

### Tests

```bash
npx playwright test
```

Reference tests run against SauceDemo and confirm the framework is working. Two tests should pass.

## Project Structure

```
platform-playwright/
├── .claude/
│   ├── commands/
│   │   ├── kernel/                        # Kernel governance commands
│   │   ├── qa-workflow.md                 # Test generation pipeline
│   │   ├── qa-workflow-dev.md             # Dev-mode generation
│   │   ├── pr.md                          # Architecture review
│   │   ├── run-test.md                    # Test execution
│   │   ├── qa-pre-construction.md         # Pre-build validation
│   │   ├── qa-on-failure.md               # Failure analysis
│   │   ├── qa-propose-fix.md              # Fix proposals
│   │   └── qa-reuse-check.md              # Reuse detection
│   ├── hooks/
│   │   ├── universal-gate-enforcer.py     # Kernel gate enforcement
│   │   └── test-failure-detector.py       # Test failure detection
│   ├── skills/
│   │   ├── kernel-domain-setup/           # Self-building kernel setup
│   │   ├── qa-management-layer/           # 5-step QA workflow skill
│   │   └── autonomous-cycling/            # Autonomous task cycling
│   ├── lessons/                           # Learned patterns from failures
│   └── settings.json
├── framework/
│   ├── _reference/                        # Canonical patterns (read-before-write)
│   │   ├── pages/                         # POM references (LoginPage, InventoryPage, CartPage, CheckoutPage)
│   │   ├── apis/                          # Api Object references (UsersApi)
│   │   ├── tasks/                         # Task references (UI + API)
│   │   ├── roles/                         # Role references (ReferenceRole)
│   │   └── tests/                         # Test references (UI + API specs)
│   ├── interfaces/
│   │   ├── browser-interface.ts           # Playwright Page wrapper
│   │   └── api-client.ts                  # Playwright APIRequestContext wrapper
│   ├── utilities/
│   │   ├── autologger.ts                  # Method logging decorator
│   │   ├── logger.ts                      # Winston logger
│   │   └── data-generator.ts              # Faker-based test data
│   ├── pages/{workflow}/                  # Generated Page Objects
│   ├── apis/{workflow}/                   # Generated Api Objects
│   ├── tasks/{workflow}/                  # Generated Tasks
│   └── roles/{workflow}/                  # Generated Roles
├── tests/
│   ├── fixtures/
│   │   └── index.ts                       # Playwright fixtures (browser_interface, api_client)
│   ├── data/
│   │   └── test_users.json                # Test credentials
│   └── {workflow}/                        # Generated test specs
├── .mcp.json                              # Playwright MCP server config
├── playwright.config.ts                   # Playwright configuration
├── tsconfig.json                          # TypeScript configuration
├── CLAUDE.md                              # Kernel bootstrap configuration
├── FRAMEWORK.md                           # Full architecture reference
├── package.json                           # Dependencies
└── LICENSE                                # Proprietary evaluation license
```

## Other Platforms

Playwright is one interface. The Isagawa Kernel supports any domain that can be validated through a structured interface.

| Platform | Language | Interface | Validates |
|----------|----------|-----------|-----------|
| [QA Platform (Selenium)](https://github.com/isagawa-qa/platform-selenium) | Python | Browser | Web UI workflows |
| QA Platform (Playwright) (this repo) | TypeScript | Browser + HTTP | Web UI, API, and hybrid workflows |
| [SSH Compliance](https://github.com/isagawa-qa/platform-ssh) | Python | SSH | Linux image configuration |

## Contact

For commercial licensing, pilot programs, or technical questions:

**Email:** [alain@isagawa.co](mailto:alain@isagawa.co)
**Web:** [isagawa.co](https://www.isagawa.co)

## License

Proprietary. Copyright (c) 2025 Isagawa. All rights reserved.

This repository is source-available for evaluation purposes. Production use requires a commercial license. See [LICENSE](LICENSE) for terms.
