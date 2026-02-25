# Platform Playwright

TypeScript + Playwright QA automation platform with 5-layer architecture and AI-driven test generation.

## Quick Start

```bash
# Clone and install
git clone https://github.com/isagawa-qa/platform-playwright.git
cd platform-playwright
npm install
npx playwright install chromium

# Run reference tests
npx playwright test

# Run headed (see browser)
npx playwright test --headed

# View report
npx playwright show-report
```

## Architecture

5-layer composition-based architecture:

```
Test (Playwright Test — arrange / act / assert)
  └→ Role (multi-task workflow, user persona)
       └→ Task (single domain operation)
            └→ Page Object (one page, atomic actions, fluent API)
                 └→ BrowserInterface (Playwright wrapper, waits, logging)
```

### Layer Rules

| Layer | Return | Composes | Locators? |
|-------|--------|----------|-----------|
| Test | N/A | Roles + POMs | No |
| Role | void | Tasks | No |
| Task | void | Page Objects | No |
| POM | this | BrowserInterface | Yes (static readonly) |

## Project Structure

```
platform-playwright/
├── framework/
│   ├── _reference/          # Canonical patterns (read these first)
│   ├── interfaces/          # BrowserInterface (Playwright wrapper)
│   └── utilities/           # Logger, autologger, data generator
├── tests/
│   ├── data/                # Test data (JSON)
│   └── fixtures/            # Playwright test fixtures
├── .claude/
│   ├── commands/kernel/     # Kernel governance commands
│   ├── skills/              # QA domain pack
│   └── hooks/               # Gate enforcer
├── playwright.config.ts
├── FRAMEWORK.md             # Full architecture reference
└── CLAUDE.md                # AI agent instructions
```

## AI-Driven Test Generation

This platform includes a QA domain pack that guides AI through a 5-step workflow:

1. **User Input** — Capture test requirement (persona, URL, workflow)
2. **Pre-flight Config** — Credential strategy, test data location
3. **AI Processing** — Generate BDD scenarios and expected states
4. **Collaborative Construction** — Discover elements, build all 5 layers
5. **Test Execution + HITL** — Run tests, triage failures with human

## Reference Implementation

The `framework/_reference/` directory contains canonical TypeScript/Playwright patterns for each layer. AI reads these before generating any code.

| Layer | Reference File |
|-------|----------------|
| POM | `framework/_reference/pages/login-page.ts` |
| Task | `framework/_reference/tasks/reference-tasks.ts` |
| Role | `framework/_reference/roles/reference-role.ts` |
| Test | `framework/_reference/tests/test-reference-workflow.spec.ts` |

## Configuration

Environment variables (`.env`):

```
BASE_URL=https://www.saucedemo.com
LOG_LEVEL=info
SCREENSHOT_DIR=screenshots
```

## License

MIT
