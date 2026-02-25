# Step 1: Prerequisites

Before domain setup, install all dependencies. Domain setup itself only indexes the repo, but the QA workflow needs Playwright CLI + browsers ready.

## Action: Run Both Commands

**Run these commands now (not just check — actually run them):**

```bash
npm install
```

```bash
npx playwright install
```

The first installs Node packages (`@playwright/test`, `@faker-js/faker`). The second installs Playwright browsers (Chromium, Firefox, WebKit) which are required for `npx playwright codegen` and `npx playwright open` to work.

## Why Both Matter

| Command | What it does | Required for |
|---------|-------------|--------------|
| `npm install` | Installs @playwright/test, @faker-js/faker | Test execution, CLI tools |
| `npx playwright install` | Downloads browser binaries | `npx playwright codegen`, `npx playwright open`, headed test runs |

**If you skip `npx playwright install`, the Playwright CLI will fail when the user runs `/qa-workflow`.**

---

## Report

```
PREREQUISITES: Installed

- npm install: done
- npx playwright install: done

Proceeding to Step 2...
```

Continue to Step 2 immediately. No restart needed for domain setup.
