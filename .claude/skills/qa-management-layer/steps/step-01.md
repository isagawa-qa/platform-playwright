---
step: 1
title: User Input
gate: validate-input
next: step-02
---

# Step 1: User Input

**Purpose:** Capture test requirement, persona, URL, and workflow identifier from user.

---

## Identity & Flow

| Field | Value |
|-------|-------|
| **Step** | 1 - User Input |
| **Dependencies** | None (first step) |
| **Input** | User describes test requirement |
| **Output** | `persona`, `URL`, `role_name`, `workflow`, `test_type`, `raw_requirement`, (optional: `api_base_url`, `endpoints`) |

---

## Skill Instruction

```
ACTION:
- ASK user: "What test do you want to create?"
  Format: "As a [persona], I want to [action]"
  Example: "As a customer, I want to purchase an item"

- ASK user: "What type of test?"
  Options:
  1. UI      - Browser-based interactions (Page Objects + BrowserInterface)
  2. API     - HTTP endpoint testing (Api Objects + ApiClient)
  3. Hybrid  - Both API and UI interactions in the same test

- ASK user: "What is the URL for this action?"
  - UI tests: application URL (e.g., "https://www.saucedemo.com")
  - API tests: API base URL (e.g., "https://api.saucedemo.com")
  - Hybrid tests: both URLs (app URL + API base URL)

- IF test_type is "api" or "hybrid":
  - ASK user: "What API endpoints will this test interact with?"
    Example: "POST /api/users, GET /api/users/{id}, DELETE /api/users/{id}"
  - ASK user: "Do you have an OpenAPI/Swagger spec?" (optional)

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
- test_type is one of: ui, api, hybrid
- role_name is PascalCase
- workflow is valid identifier (alphanumeric + hyphen/underscore)
- If api/hybrid: at least one endpoint specified

OUTPUT:
  Step 1: User Input
  • Persona: standard user
  • Role: StandardUser
  • Test Type: hybrid
  • Workflow: checkout-v1
  • URL: https://www.saucedemo.com
  • API Base URL: https://api.saucedemo.com
  • Endpoints: POST /api/users, GET /api/users/{id}
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
    "api_base_url": "https://api.saucedemo.com",
    "role_name": "StandardUser",
    "workflow": "checkout-v1",
    "test_type": "hybrid",
    "endpoints": ["POST /api/users", "GET /api/users/{id}"],
    "raw_requirement": "As a standard user, I want to purchase an item"
  }
}
```

---

*Next: Step 2 - Pre-flight Configuration*
