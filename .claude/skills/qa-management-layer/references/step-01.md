# Step 1: User Input

**Purpose:** Capture test requirement, persona, URL, and workflow identifier from user.

---

## Identity & Flow

| Field | Value |
|-------|-------|
| **Step** | 1 - User Input |
| **Dependencies** | None (first step) |
| **Input** | User describes test requirement |
| **Output** | `persona`, `URL`, `role_name`, `workflow`, `raw_requirement` |

---

## Skill Instruction

```
ACTION:
- ASK user: "What test do you want to create?"
  Format: "As a [persona], I want to [action]"
  Example: "As a customer, I want to purchase an item"

- ASK user: "What is the URL for this action?"
  Example: "https://www.saucedemo.com"

- ASK user: "Workflow identifier?"
  Explanation: "This creates folders at framework/pages/{workflow}/ and tests/{workflow}/
               Use to organize tests by: feature (checkout-v2), sprint (auth-sprint-2)"

- EXTRACT from requirement:
  - persona: Extract from "As a [X]" pattern
  - role_name: Convert persona to PascalCase (standard user → StandardUser)
  - raw_requirement: Store full user requirement verbatim

VALIDATE:
- persona present
- URL is valid HTTP/HTTPS
- role_name is PascalCase
- workflow is valid identifier (alphanumeric + hyphen/underscore)

OUTPUT:
  Step 1: User Input
  • Persona: standard user
  • Role: StandardUser
  • Workflow: checkout-v1
  • URL: https://www.saucedemo.com
```

---

## State Schema

```json
{
  "step": 1,
  "status": "complete",
  "data": {
    "persona": "standard user",
    "URL": "https://www.saucedemo.com",
    "role_name": "StandardUser",
    "workflow": "checkout-v1",
    "raw_requirement": "As a standard user, I want to purchase an item"
  }
}
```

---

*Next: Step 2 - Pre-flight Configuration*
