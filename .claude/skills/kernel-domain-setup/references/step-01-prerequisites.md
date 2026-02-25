# Step 1: Prerequisites

Before domain setup, verify core dependencies are installed.

**Domain setup indexes the repo and builds a protocol. It does NOT require browser access.**

## Node Dependencies

Check `package.json` exists and install:

```bash
npm install
```

### Required packages:
- @playwright/test
- @faker-js/faker

## Playwright Browsers

Verify Playwright browsers are installed:

```bash
npx playwright install
```

## Checklist

| Dependency | Check | Action if Missing |
|------------|-------|-------------------|
| Node deps | `package.json` has @playwright/test | `npm install` |
| Browsers | Playwright browsers installed | `npx playwright install` |

---

## Report

```
PREREQUISITES: Verified

- Node dependencies installed
- Playwright browsers available

Proceeding to Step 2...
```

Continue to Step 2 immediately. No restart needed for domain setup.
