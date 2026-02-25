# Step 2: Pre-flight Configuration

**Purpose:** Establish configuration strategy before test construction begins.

---

## Identity & Flow

| Field | Value |
|-------|-------|
| **Step** | 2 - Pre-flight Configuration |
| **Dependencies** | Step 1 complete |
| **Input** | Step 1 output (persona, URL, workflow) |
| **Output** | `credential_strategy`, `test_data_location`, `browser_config` |

---

## Skill Instruction

```
ACTION:
- ASK user Question 1: Credential strategy?
  Options:
  1. Static        - Use existing account from test_users.json
  2. Dynamic       - Register fresh user, save for later tests
  3. Self-contained - Register and use within same test
  4. None needed   - Test doesn't require credentials

- ASK user Question 2: Test data location?
  Options:
  1. Shared            - tests/data/ (cross-workflow)
  2. Workflow-specific - tests/{workflow}/data/
  3. Both              - Shared credentials + workflow-specific data
  4. None needed       - Test doesn't require external data

- Browser visibility:
  headless=false is REQUIRED for pair programming (non-negotiable)

VALIDATE:
- credential_strategy is one of: static, dynamic, self-contained, none
- test_data_location is one of: shared, workflow, both, none

SCAFFOLD (if needed):
- If credential_strategy requires test_users.json → create tests/data/test_users.json
- If workflow-specific → create tests/{workflow}/data/ directory

OUTPUT:
  Step 2: Pre-flight Configuration
  • Credentials: static (use existing account)
  • Test data: workflow-specific
  • Browser: visible (headed)
```

---

## Playwright-Specific Config

```typescript
// playwright.config.ts overrides for pair programming
use: {
  headless: false,    // REQUIRED for pair programming
  trace: 'on',        // Capture trace for debugging
  video: 'on',        // Record video for review
}
```

---

## State Schema

```json
{
  "step": 2,
  "status": "complete",
  "data": {
    "credential_strategy": "static",
    "test_data_location": "shared",
    "browser_config": {
      "headless": false
    }
  }
}
```

---

*Next: Step 3 - AI Processing*
