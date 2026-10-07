# Isagawa QA Platform (Playwright)

[![TypeScript 5.7+](https://img.shields.io/badge/TypeScript-5.7%2B-blue.svg)](https://www.typescriptlang.org/)
[![Playwright 1.50+](https://img.shields.io/badge/Playwright-1.50%2B-green.svg)](https://playwright.dev/)

AI-driven test automation for web applications in TypeScript. Describe what you want to test in plain English, and an AI agent explores the application and its APIs, writes UI, API, and hybrid tests into one consistent framework, and runs them with Playwright. Every generated test is code your team owns and maintains.

Built on the [Isagawa Kernel](https://github.com/isagawa-co/isagawa-kernel).

## The Problem

QA automation on web applications breaks down in predictable ways. Locators are scattered across test files. API endpoints are duplicated. Every engineer writes tests differently. When the UI changes, dozens of tests break. When the API contract changes, nobody knows which tests are affected. AI-generated test code makes it worse because there is no enforcement keeping the generated code on pattern.

The result is a test suite that is expensive to maintain, unreliable to run, and impossible to hand off.

## The Solution

UI, API, and hybrid tests share one structure, so a suite stays consistent as it grows and a UI or API change is fixed in one place instead of dozens. The agent works under guardrails from the [Isagawa Kernel](https://github.com/isagawa-co/isagawa-kernel), so it follows your conventions instead of improvising.

## How It Works

1. **Describe.** Give the agent a requirement in plain English: who the user is, what they do, and where.
2. **Explore.** The agent opens the application in a live browser and calls its APIs and maps what the test needs.
3. **Build.** It writes the test and its supporting code into one consistent structure, reusing what already exists instead of duplicating it.
4. **Run.** Tests run with `npx playwright test` against the target application.
5. **Triage.** On a failure, the agent separates an application defect from a test problem and proposes a fix for you to approve.
6. **Learn.** What went wrong is recorded, so later tests avoid the same mistake.

**Example:**

```
Requirement: "As a standard user, I want to log in and add items to my cart"
Result:      UI and API checks for login, add to cart, and cart contents, all passing
```

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

## Other Platforms

Playwright is one interface. The Isagawa Kernel supports any domain that can be validated through a structured interface.

| Platform | Language | Interface | Validates |
|----------|----------|-----------|-----------|
| [QA Platform (Selenium)](https://github.com/isagawa-qa/platform-selenium) | Python | Browser | Web UI workflows |
| QA Platform (Playwright) (this repo) | TypeScript | Browser + HTTP | Web UI, API, and hybrid workflows |
| [SSH Compliance](https://github.com/isagawa-qa/platform-ssh) | Python | SSH | Linux image configuration |

## Author

Built by Alain Ignacio, QA lead and test automation architect.
Portfolio: [alain-ignacio.github.io](https://alain-ignacio.github.io) · LinkedIn: [linkedin.com/in/alain-ignacio](https://www.linkedin.com/in/alain-ignacio)

## License

Proprietary. Copyright (c) 2025 Isagawa. All rights reserved. Source is available for evaluation only. See [LICENSE](LICENSE).
