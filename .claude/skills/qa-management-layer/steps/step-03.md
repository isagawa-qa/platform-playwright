---
step: 3
title: AI Processing
gate: validate-scenarios
next: step-04
---

# Step 3: AI Processing

**Purpose:** Transform user requirement into structured metadata (BDD scenarios, expected states, intent).

---

## Identity & Flow

| Field | Value |
|-------|-------|
| **Step** | 3 - AI Processing |
| **Dependencies** | Step 2 complete |
| **Input** | Step 2 output + original requirement |
| **Output** | `bdd_scenarios`, `expected_states`, `intent` |

---

## Skill Instruction

```
ACTION:
- READ raw_requirement and test_type from Step 1 state
- CREATE BDD scenario with Given/When/Then structure
  - UI tests: Given/When/Then use browser interactions
  - API tests: Given/When/Then use HTTP verbs and endpoints
  - Hybrid tests: Given/When/Then mix API and UI steps
- EXTRACT expected_states from "Then" clauses
  - UI: state-check method names (is_order_complete, is_confirmation_visible)
  - API: response checks (status_201, body_has_id, user_exists)
- DETERMINE intent (action verb from requirement)

BDD EXAMPLES BY TEST TYPE:

  UI:
    Given I am on the SauceDemo login page
    When I login with valid credentials
    Then I should see the inventory page

  API:
    Given I have a valid auth token
    When I POST to /api/users with name "John" and email "john@test.com"
    Then the response status should be 201
    And the response body should contain an id

  Hybrid:
    Given I create a user via POST /api/users
    When I navigate to the Users page
    Then the new user should appear in the users table

VALIDATE:
- bdd_scenarios has valid Given/When/Then structure
- At least one expected_state derived from "Then" clause
- intent is an action verb
- API/hybrid scenarios reference specific endpoints from Step 1

RETRY:
- If validation fails: AI retries processing (max 3 attempts)
- After 3 failures: STOP → REPORT → USER DECIDES

OUTPUT:
  Step 3: AI Processing
  • Intent: purchase
  • Test Type: hybrid
  • BDD Scenarios: 1
  • Expected States: status_201, user_exists, is_user_displayed
```

---

## State Schema

```json
{
  "step": 3,
  "status": "complete",
  "data": {
    "bdd_scenarios": [
      {
        "given": "I am on the SauceDemo login page",
        "when": [
          "I login with valid credentials",
          "I add an item to cart",
          "I complete checkout"
        ],
        "then": [
          "I should see order confirmation",
          "I should see 'Thank you for your order!'"
        ]
      }
    ],
    "expected_states": ["is_order_complete", "is_confirmation_visible"],
    "intent": "purchase"
  }
}
```

---

*Next: Step 4 - Element Discovery + Collaborative Construction*
