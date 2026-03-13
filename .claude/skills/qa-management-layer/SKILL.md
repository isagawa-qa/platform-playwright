---
name: qa-management-layer
description: Guide AI through 5-step QA test generation workflow with quality gates, collaborative construction, and HITL pair programming. TypeScript/Playwright edition. Use WHEN generating test automation from user stories or executing the test generation pipeline.
---

# QA Guidance Layer (TypeScript/Playwright)

**Purpose:** Guide AI through the 5-step QA test generation workflow with enforced quality gates, collaborative construction, and HITL pair programming on test failures.

**Applies to:** QA test automation generation using Playwright + TypeScript.

**Part of:** QA Management Engine (guidance layer + quality gates + state)

**Workflow Type:** Pair Programming (Human guides, AI builds incrementally with real-time validation)

---

## When to Use This Skill

Use when:
- User wants to generate test automation code
- User provides a user story or test requirement
- Starting the 5-step workflow from Step 1

---

## Communication Guidelines

**DO NOT show users:**
- Internal gate status ("Gate: PASS", "POST-VALIDATE: PASS")
- Gate implementation details
- Internal field names (input_data, metadata)

**DO show users:**
- "Step X Complete" (without gate status)
- Progress indicators ("Discovering elements...", "Generating POM...")
- Actionable errors only (if gate fails, explain what to fix, not gate mechanics)

---

## Workflow Overview

```
  Step 1: User Input           ──► persona, URL, role_name, workflow, test_type
      │
      ▼
  Step 2: Pre-flight Config    ──► credential_strategy, api_auth_strategy, test_data_location
      │
      ▼
  Step 3: AI Processing        ──► bdd_scenarios, expected_states, intent
      │
      ▼
  Step 4: Collaborative Construction
      │
      ├─► test_type?
      │     ├─ UI:     Playwright MCP element discovery → POMs
      │     ├─ API:    Endpoint discovery → Api Objects
      │     └─ Hybrid: Both discovery paths
      │
      ├─► AI builds POMs and/or Api Objects (Edit/Write tools)
      ├─► AI builds Tasks (Edit/Write tools)
      ├─► AI builds Roles (Edit/Write tools)
      ├─► AI builds Tests (Edit/Write tools)
      │
      └─► Gates validate each piece (framework compliance)
      │
      ▼
  Step 5: Test Execution + HITL Iteration
      │
      ├─► npx playwright test: Execute test
      │
      ├── PASS ──► WORKFLOW COMPLETE
      │
      └── FAIL ──► HITL Triage:
                    1. Application Defect → Log + Block
                    2. Test Issue → AI fixes + Retry
                    3. Investigate → Show diagnostic data
```

---

## Step References

| Step | Reference | Description |
|------|-----------|-------------|
| 1 | `steps/step-01.md` | User Input |
| 2 | `steps/step-02.md` | Pre-flight Configuration |
| 3 | `steps/step-03.md` | AI Processing |
| 4 | `steps/step-04.md` | Element Discovery + Collaborative Construction |
| 5 | `steps/step-05.md` | Test Execution + HITL Iteration |

---

## Execution Rules

```
1. SEQUENTIAL EXECUTION
   - Must complete Step N before Step N+1
   - Quality gate must PASS before proceeding
   - No skipping steps

2. GATE ENFORCEMENT
   - Each step has validation criteria
   - BLOCKED until criteria pass

3. STATE PERSISTENCE
   - Each step saves state on success
   - State enables resume on failure
   - Accumulated data flows through steps

4. STOP-AND-DISCUSS
   - On ANY blocker: STOP → REPORT → DISCUSS → PROCEED
   - Never loop through fixes without user
   - User decides resolution path
```

---

## 5-Layer Architecture (TypeScript/Playwright)

```
UI Path:   Test → Role → Task → Page Object → BrowserInterface → Browser
API Path:  Test → Role → Task → Api Object  → ApiClient        → HTTP
Hybrid:    Test → Role → Task → POM + Api Object → BI + ApiClient
```

### Layer Rules

| Layer | Decorator | Return Value | Composes | Fluent API |
|-------|-----------|--------------|----------|------------|
| **Page Object** | None | `this` | BrowserInterface | Yes |
| **Api Object** | None | `this` | ApiClient | Yes |
| **Task** | `@autologger('Task')` | void | POMs, Api Objects, or both | No (uses fluent API) |
| **Role** | `@autologger('Role')` | void | Tasks | No |
| **Test** | None (Playwright test()) | N/A | Roles + POMs/Api Objects (assert) | No |

### Critical Rules

- **Tasks return void** — Tests assert via POM/Api Object state-check methods
- **Roles return void** — Tests assert via POM/Api Object state-check methods
- **Page Objects return this** — Enables fluent chaining for Tasks
- **Api Objects return this** — Enables fluent chaining for Tasks
- **State-check methods return boolean/string/number** — For test assertions
- **Locators ONLY in Page Objects** — Static readonly class constants
- **Endpoint paths ONLY in Api Objects** — Static readonly constants/methods
- **Composition over inheritance** — No base classes

---

## Self-Heal Validation Protocol

When AI generates skeleton or incomplete code, it must self-heal:

```
  AI generates code
      │
      ▼
  Validate against layer rules
      │
      ├── PASS ──► Proceed to next layer
      │
      └── FAIL ──► Retry (max 3 attempts)
              │
              └── After 3 failures ──► Smart Escalation
```

### Layer Pattern Summary

| Layer | Must Have | Must NOT Have |
|-------|-----------|---------------|
| **POM** | Static locators, atomic methods (return this), state methods | Task/Role imports, workflow logic |
| **Api Object** | Static endpoint paths, typed req/res, atomic methods (return this), state methods | Task/Role imports, fetch/axios calls |
| **Task** | @autologger, POM/Api Object composition, void return | Locator strings, endpoint URLs, return values |
| **Role** | @autologger, Task composition, void return | POM/Api Object imports, direct calls |
| **Test** | test(), expect(), Role calls, POM/Api Object assertions | Task calls, direct action calls |

---

## Element Discovery (Playwright MCP)

Use the Playwright MCP server for element discovery. The MCP provides browser tools that let the agent navigate pages, inspect the accessibility tree, and extract selectors.

The Playwright MCP is configured in `.mcp.json` (project root) and loads at Claude Code startup.

AI uses MCP tools to discover elements, then builds locators for Page Objects.

---

## Test Execution

```bash
# Run specific test
npx playwright test tests/{workflow}/test-{name}.spec.ts

# Run headed (for pair programming)
npx playwright test --headed

# Run with trace
npx playwright test --trace on
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `FRAMEWORK.md` | Full architecture reference (UI + API) |
| `framework/_reference/` | Canonical TypeScript patterns (POMs, Api Objects, Tasks, Tests) |
| `framework/interfaces/` | BrowserInterface (UI) + ApiClient (API) |
| `CLAUDE.md` | Kernel instructions |

---

*Living document - update as workflow evolves.*
