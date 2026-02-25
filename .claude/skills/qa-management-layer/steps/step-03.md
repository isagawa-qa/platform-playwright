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
- READ raw_requirement from Step 1 state
- CREATE BDD scenario with Given/When/Then structure
- EXTRACT expected_states from "Then" clauses
- DETERMINE intent (action verb from requirement)

VALIDATE:
- bdd_scenarios has valid Given/When/Then structure
- At least one expected_state derived from "Then" clause
- intent is an action verb

RETRY:
- If validation fails: AI retries processing (max 3 attempts)
- After 3 failures: STOP → REPORT → USER DECIDES

OUTPUT:
  Step 3: AI Processing
  • Intent: purchase
  • BDD Scenarios: 1
  • Expected States: is_order_complete, is_confirmation_visible
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
