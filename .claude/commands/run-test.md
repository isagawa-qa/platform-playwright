---
description: Run tests with Playwright HTML reporter (invoke with test path argument)
---

# Run Test Command

Execute tests following the testing skill protocol.

## Kernel Loop Integration

1. **Anchor first:** Invoke `/kernel/anchor` before executing tests
2. **On failure:** Invoke `/kernel/fix` then `/kernel/learn` after any fix
3. **On completion:** Invoke `/kernel/complete` when tests pass

## Usage

```
/run-test tests/checkout-v1/test-purchase.spec.ts
/run-test tests/auth/test-login.spec.ts
/run-test tests/  # Run all tests
```

## Instructions

**FIRST: Read protocol from `.claude/protocols/qa-protocol.md`**

The testing skill defines:
- Visual feedback requirements
- Failure handling protocol (STOP, REPORT, ANALYZE, DISCUSS)
- Defect tracking requirements

### Step 1: Validate Test Path

Check that the provided argument `$ARGUMENTS` is a valid test path:
- File exists (for specific test file)
- Directory exists (for test directory)
- Pattern is valid Playwright format

If invalid, report error and suggest valid paths.

### Step 2: Run Test Command

**Project convention (platform-playwright):**

```bash
npx playwright test $ARGUMENTS --reporter=html
```

### Step 3: Visual Feedback

During execution, show:
- Test names as they run
- PASSED/FAILED status per test
- Progress indication

### Step 4: Results Summary

After execution, show:
- Total passed/failed count
- Report file location: `playwright-report/index.html`
- Clear PASS/FAIL verdict

### Step 5: On Failure (CRITICAL)

If ANY test fails, follow the on-failure checkpoint:

1. **STOP** — Halt, do not auto-fix
2. **REPORT** — Show: test name, error, location
3. **ANALYZE** — Explain: expected vs actual, likely cause
4. **DISCUSS** — Ask: "Create defect entry in docs/DEFECT_LOG.md?"
5. **FIX OPTIONS** — Present 2-3 fix approaches with tradeoffs
6. **DISCUSS FIX** — Ask: "Which fix approach? Proceed?"
7. **FIX** — Implement approved fix only
8. **RE-TEST** — Run same tests again

**Never auto-fix without user approval.**

## Example Output

```
Running: npx playwright test tests/checkout-v1/test-purchase.spec.ts --reporter=html

  checkout-v1/test-purchase.spec.ts
    ✓ standard user can complete checkout (5.2s)

  1 passed (5.2s)

Report: playwright-report/index.html

VERDICT: PASS
```
