# QA Workflow (5-Step)

**Purpose:** Index of the 5-step QA workflow. Agent reads this to understand data flow and validation criteria.

---

## Workflow Overview

```
Step 1: User Input ──► persona, URL, workflow
    │
    ▼ (validate, teach, save state)
Step 2: Pre-flight ──► credential_strategy (browser always running)
    │
    ▼ (validate, teach, save state)
Step 3: AI Processing ──► bdd_scenarios, expected_states, intent
    │
    ▼ (validate, teach, save state)
Step 4: Construction ──► discovered_elements, POM, Task, Role, Test files
    │
    ▼ (validate, teach, save state)
Step 5: Execution ──► test_result, HITL triage if failed
    │
    ▼ (validate, teach, learn)
COMPLETE ──► lessons stored via /kernel/learn
```

---

## Step Index

| Step | Purpose | Input | Output | Reference |
|------|---------|-------|--------|-----------|
| 1 | User Input | User requirement | persona, URL, workflow, role_name | `steps/step-01.md` |
| 2 | Pre-flight | Step 1 state | credential_strategy | `steps/step-02.md` |
| 3 | AI Processing | Steps 1-2 state | bdd_scenarios, expected_states, intent | `steps/step-03.md` |
| 4 | Construction | Steps 1-3 state + Playwright | elements, POM, Task, Role, Test | `steps/step-04.md` |
| 5 | Execution | Step 4 files | test_result, triage_decision | `steps/step-05.md` |

---

## Data Flow

```
USER INPUT
    │
    └──► { persona, URL, workflow, role_name, raw_requirement }
              │
              ▼
         PRE-FLIGHT
              │
              └──► { credential_strategy }
                        │
                        ▼
                   AI PROCESSING
                        │
                        └──► { bdd_scenarios, expected_states, intent }
                                  │
                                  ▼
                             CONSTRUCTION
                                  │
                                  └──► { discovered_elements, files_created[] }
                                            │
                                            ▼
                                       EXECUTION
                                            │
                                            └──► { test_result, lessons[] }
```

---

## Validation Per Step

Agent self-enforces validation at each step:

| Step | Validates | Teaches | On Failure |
|------|-----------|---------|------------|
| 1 | persona, URL, workflow present | User input patterns | ASK user for missing info |
| 2 | credential_strategy valid | Credential preferences | ASK user again |
| 3 | bdd_scenarios, expected_states, intent present | BDD extraction patterns | STOP, ask user |
| 4 | elements discovered, files created | Construction patterns | STOP, ask user |
| 5 | test passes | Failure patterns, fixes | STOP, HITL triage |

**CRITICAL: On ANY failure, agent STOPS and asks user. No autonomous looping.**

---

## Mandatory Pre-Construction (Step 4)

Before writing ANY code in Step 4:

```
1. READ reference files:
   - framework/_reference/pages/*.ts
   - framework/_reference/tasks/*.ts
   - framework/_reference/roles/*.ts
   - framework/_reference/tests/*.ts

2. READ BrowserInterface:
   - framework/interfaces/browser-interface.ts
   - Use existing methods, ask before creating new ones

3. ONLY THEN write code following reference patterns
```

**DO NOT skip these reads. DO NOT write from memory.**

---

## State Location

All steps save state to: `tests/_state/workflow_state.json`

```json
{
  "current_step": 3,
  "steps": {
    "1": { "status": "complete", "data": {} },
    "2": { "status": "complete", "data": {} },
    "3": { "status": "in_progress", "data": {} }
  }
}
```

---

## Learning Flow

```
Each step:
    │
    ├── VALIDATES ──► creates lesson
    │
    ├── TEACHES ──► sends to /kernel/learn
    │
    └── LEARNS ──► applies lessons next run

Lessons accumulate ──► agent improves ──► fewer failures
```

---

## Protocol Execution

When user invokes `/qa-workflow`:

```
/kernel/anchor (reads protocol)
    │
    ▼
Protocol points to this skill
    │
    ▼
Agent reads workflow.md + gate-contract.md
    │
    ▼
FOR step 1 to 5:
    │
    ├── READ criteria from steps/step-XX.md
    │
    ├── EXECUTE step actions
    │
    ├── VALIDATE per gate-contract
    │       ├── PASS: save state, continue
    │       ├── RETRY: loop with teaching
    │       └── FAIL: block, escalate to HITL
    │
    ├── TEACH lesson
    │
    └── LEARN via /kernel/learn
    │
/kernel/complete
```

---

*Read step files for detailed criteria. See gate-contract.md for validation rules.*
