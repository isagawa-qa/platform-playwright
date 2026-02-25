# Step 8: Build Protocol

Create `.claude/protocols/qa-protocol.md` as a **pure index** (no content duplication).

## Protocol Template

```markdown
# QA Protocol

**Domain:** qa
**Type:** Indexed
**Created:** [timestamp]

---

## References

### Code Patterns
| Layer | Reference |
|-------|-----------|
| POM | `framework/_reference/pages/*.ts` |
| Task | `framework/_reference/tasks/*.ts` |
| Role | `framework/_reference/roles/*.ts` |
| Test | `framework/_reference/tests/*.ts` |

### Infrastructure
| File | Purpose |
|------|---------|
| `framework/interfaces/browser-interface.ts` | Playwright wrapper |
| `framework/utilities/autologger.ts` | Logging decorator |
| `framework/utilities/data-generator.ts` | Test data utilities |

### Workflow (5-Step)
| File | Purpose |
|------|---------|
| `.claude/skills/qa-management-layer/SKILL.md` | Entry point |
| `.claude/skills/qa-management-layer/workflow.md` | 5-step index, data flow |
| `.claude/skills/qa-management-layer/gate-contract.md` | Validation contract |
| `.claude/skills/qa-management-layer/steps/*.md` | Step criteria |

### Test Setup
| File | Purpose |
|------|---------|
| `tests/fixtures/index.ts` | Playwright fixtures |
| `tests/data/` | Test data files |

### Entry Points
| Command | Purpose |
|---------|---------|
| `/qa-workflow` | Production mode |
| `/qa-workflow-dev` | Development mode |
| `/run-test` | Execute tests |
| `/pr` | Code review |

### Lessons Learned
→ `.claude/lessons/lessons.md`

---

*Protocol is an INDEX. Agent reads referenced files during /kernel/anchor.*
```

## How Commands Execute via Protocol

When user types `/qa-workflow`:

```
1. Command wrapper invokes /kernel/anchor
2. Anchor reads this protocol
3. Protocol points to qa-management-layer
4. Agent reads qa-management-layer/workflow.md
5. Agent executes 5 steps, self-enforcing validation per gate-contract
6. On failure: /kernel/learn captures lesson
7. On success: /kernel/complete resets counter
```

## Critical Rules

- Do NOT copy code examples into protocol
- Do NOT duplicate workflow content
- Agent reads actual reference files during `/kernel/anchor`
- Agent self-enforces validation criteria while executing workflow
- This keeps protocol small and prevents drift

## Create Lessons Folder

```
.claude/lessons/
└── lessons.md
```

Initialize `.claude/lessons/lessons.md` with:

```markdown
# Lessons Learned

*Accumulated knowledge from workflow failures. Updated by /kernel/learn.*

---

*(Empty — filled by /kernel/learn)*
```

---

## Step 8b: Adaptive Indexing Rule

**Threshold: 200 lines**

When any referenced file exceeds 200 lines:
1. Convert file to indexed folder
2. Split content into logical chunks
3. Create index file pointing to chunks
4. Update parent reference

---

## Step 8c: Dynamic Category Creation

When content doesn't fit existing categories:

1. Create new folder under `.claude/` with descriptive name
2. Create initial file (e.g., `.claude/[category]/[category].md`)
3. Update protocol to add new reference
4. Apply 200-line rule

**Naming convention:**
- Folder: lowercase, hyphens (e.g., `edge-cases`)
- File: same as folder (e.g., `edge-cases.md`)
- Protocol section: Title Case (e.g., `### Edge Cases`)
