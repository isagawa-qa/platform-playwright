---
step: 2
title: Pre-flight Configuration
gate: validate-config
next: step-03
---

# Step 2: Pre-flight Configuration

**Purpose:** Establish configuration strategy before test construction begins.

---

## Identity & Flow

| Field | Value |
|-------|-------|
| **Step** | 2 - Pre-flight Configuration |
| **Dependencies** | Step 1 complete |
| **Input** | Step 1 output (persona, URL, workflow) |
| **Output** | `credential_strategy`, `api_auth_strategy`, `test_data_location`, `browser_config` |

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

- IF test_type is "api" or "hybrid":
  ASK user Question 1b: API authentication strategy?
  Options:
  1. Bearer token   - Token set via ApiClient.setAuthToken()
  2. API key        - Key sent in default headers (X-API-Key)
  3. Session cookie - Shared auth state with browser context
  4. None needed    - Public API, no auth required

- ASK user Question 2: Test data location?
  Options:
  1. Shared            - tests/data/ (cross-workflow)
  2. Workflow-specific - tests/{workflow}/data/
  3. Both              - Shared credentials + workflow-specific data
  4. None needed       - Test doesn't require external data

- Browser visibility (UI and hybrid tests only):
  headless=false is REQUIRED for pair programming (non-negotiable)

VALIDATE:
- credential_strategy is one of: static, dynamic, self-contained, none
- api_auth_strategy is one of: bearer, api_key, session, none (required if test_type is api/hybrid)
- test_data_location is one of: shared, workflow, both, none

SCAFFOLD (if needed):
- If credential_strategy requires test_users.json → create tests/data/test_users.json
- If workflow-specific → create tests/{workflow}/data/ directory

OUTPUT:
  Step 2: Pre-flight Configuration
  • Credentials: static (use existing account)
  • API Auth: bearer token
  • Test data: workflow-specific
  • Browser: visible (headed)
```

---

## Playwright-Specific Config

```typescript
// playwright.config.ts overrides for pair programming
use: {
  headless: false,    // REQUIRED for pair programming (UI/hybrid)
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
    "api_auth_strategy": "bearer",
    "test_data_location": "shared",
    "browser_config": {
      "headless": false
    }
  }
}
```

---

*Next: Step 3 - AI Processing*
