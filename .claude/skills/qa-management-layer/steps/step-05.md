# Step 5: Test Execution & HITL Iteration

**Purpose:** Execute test, validate results with HITL triage for failures.

---

## Identity & Flow

| Field | Value |
|-------|-------|
| **Step** | 5 - Test Execution & HITL Iteration |
| **Dependencies** | Step 4 complete (all modules generated and saved) |
| **Input** | Test files from Step 4, workflow state |
| **Output** | Test execution result, HITL triage decisions (if failure) |

---

## On-Failure Checkpoint (MANDATORY)

**When ANY test failure occurs, invoke the on-failure checkpoint:**

Read and follow: `.claude/skills/qa-management-layer/checkpoints/on-failure.md`

This ensures:
- STOP immediately (no autonomous fixes)
- Report failure to user with structured template
- Wait for user to choose resolution path
- If user chooses "AI Proposes Fix", invoke `/qa-propose-fix`

**Do not skip this checkpoint. HITL is mandatory.**

---

## Skill Instruction

```
PRE-CHECK:
- Verify Step 4 complete (all files saved)
- Verify test file path exists
- Verify workflow state has all metadata

ACTION:
1. EXECUTE test via Bash:
   npx playwright test tests/{workflow}/test-{name}.spec.ts --headed

2. Capture exit code and output
3. Construct test_result:
   {
     "status": "passed" | "failed" | "crashed",
     "exit_code": <exit_code>,
     "output": <stdout + stderr>,
     "duration": <execution time>
   }

VALIDATE:
- If test passed → WORKFLOW COMPLETE
- If test failed → invoke on-failure checkpoint (see above)

RETRY POLICY:
- Max 2 retries per unique error
- Track error signatures for flaky test detection

COMPLETION:
- ONLY mark complete if test passes
- Workflow status remains IN PROGRESS until test passes
```

---

## Playwright-Specific Execution

```bash
# Run specific test (headed for pair programming)
npx playwright test tests/{workflow}/test-{name}.spec.ts --headed

# Run with trace (for debugging failures)
npx playwright test tests/{workflow}/test-{name}.spec.ts --trace on

# Run with video recording
npx playwright test tests/{workflow}/test-{name}.spec.ts --video on

# View test report
npx playwright show-report

# View trace
npx playwright show-trace test-results/{test-name}/trace.zip
```

---

## HITL Triage Template (on test failure)

```
TEST EXECUTION FAILED

Test: tests/{workflow}/test-{name}.spec.ts
Duration: X.Xs
Exit Code: 1

Error:
[Playwright error output]

AI Analysis (Confidence: XX%):
Likely cause: [hypothesis]
Evidence: [supporting data]
Suggested fix: [actionable guidance]

HOW SHOULD WE PROCEED?

1. Application Defect
   → Log defect, block workflow (you fix the app)

2. Test Issue
   → AI investigates + fixes test code, retry

3. Investigate
   → Show full diagnostic data, you analyze

4. Other
   → Describe what you want to do

Select option (1-4):
```

---

## Diagnostic Data (Playwright)

| Data Type | Source |
|-----------|--------|
| Test Output | Playwright test runner stdout/stderr |
| Trace | `test-results/{name}/trace.zip` |
| Screenshots | `test-results/{name}/*.png` |
| Video | `test-results/{name}/*.webm` |
| Console Logs | Captured via Playwright `page.on('console')` |
| Network | Captured via `page.on('request'/'response')` |

---

## State Schema

```json
{
  "step": 5,
  "status": "complete",
  "data": {
    "test_result": {
      "status": "passed",
      "exit_code": 0,
      "output": "1 passed",
      "duration": 5.2
    },
    "retry_count": 0
  }
}
```

---

## User Communication

**In Progress:**
```
Step 5: Executing Test...
  - Test: tests/checkout-v1/test-purchase.spec.ts
  - Browser: headed
  [Test execution in progress...]
```

**Complete (Passed):**
```
Step 5: Test Execution
  - Status: PASSED
  - Duration: 5.2s

5-Step QA Workflow Complete!
```

**Failed (Awaiting Triage):**
```
Step 5: Test Execution - FAILED (Awaiting Triage)
  - Status: FAILED
  - Error: [brief error description]
  - Next: Choose fix strategy (1-4)
```

---

*Step 5 completes the 5-Step QA Workflow.*
