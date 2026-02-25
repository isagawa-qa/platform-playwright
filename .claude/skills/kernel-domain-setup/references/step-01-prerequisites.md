# Step 1: Prerequisites

Verify the toolchain is ready. Dependencies are preinstalled in the repo.

## Quick Verification

Run this to confirm the Playwright CLI is available:

```bash
npx playwright --version
```

If this prints a version number, everything is ready. The Playwright CLI (`codegen`, `open`) ships with `@playwright/test` which is already in `package.json`.

## Playwright CLI — Element Discovery Tool

This platform uses the **Playwright CLI** for element discovery during the QA workflow (Step 4):

```bash
# Interactive element discovery — opens browser, records selectors
npx playwright codegen <url>

# Open page for manual inspection
npx playwright open <url>
```

These replace MCP-based discovery. No MCP servers are used in this platform.

## Checklist

| Check | Command | Expected |
|-------|---------|----------|
| Playwright CLI | `npx playwright --version` | Version number |
| Node modules | `ls node_modules/@playwright/test` | Directory exists |

---

## Report

```
PREREQUISITES: Verified

- Playwright CLI available (vX.X.X)
- Element discovery via: npx playwright codegen <url>

Proceeding to Step 2...
```

Continue to Step 2 immediately. No restart needed.
