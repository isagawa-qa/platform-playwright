# Step 1: Prerequisites

Before domain setup, verify all dependencies are installed and configured.

## Node Dependencies

Check `node_modules/` exists and has required packages:

- `@playwright/test` — Test runner + Playwright CLI
- `@faker-js/faker` — Test data generation

## Playwright CLI (Element Discovery)

This platform uses the **Playwright CLI** for element discovery during the QA workflow (Step 4):

```bash
# Interactive element discovery — opens browser, records selectors
npx playwright codegen <url>

# Open page for manual inspection
npx playwright open <url>
```

The Playwright CLI ships with `@playwright/test`. Verify it's available:

```bash
npx playwright --version
```

## Playwright Browsers

Verify browsers are installed (needed for `codegen`, `open`, and headed test runs):

```bash
npx playwright install --dry-run
```

## Checklist

| Dependency | Check | Action if Missing |
|------------|-------|-------------------|
| Node deps | `node_modules/@playwright/test` exists | `npm install` |
| Playwright CLI | `npx playwright --version` prints version | Comes with @playwright/test |
| Browsers | `npx playwright install --dry-run` shows installed | `npx playwright install` |

---

## All Configured

```
PREREQUISITES: All configured

- Node dependencies installed
- Playwright CLI available
- Browsers installed

Proceeding to Step 2...
```

Continue to Step 2 immediately. No restart needed.
