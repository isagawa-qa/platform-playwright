# Step 7: Read Workflow

Read workflow skill files to understand command execution:

| File | Extract |
|------|---------|
| `.claude/skills/qa-management-layer/SKILL.md` | Workflow entry point, philosophy |
| `.claude/skills/qa-management-layer/workflow.md` | 5-step index, data flow |
| `.claude/skills/qa-management-layer/gate-contract.md` | Validation contract (validate, teach, learn) |
| `.claude/skills/qa-management-layer/steps/*.md` | Step-specific criteria |

## Identify

- Workflow steps (5 steps for qa-management-layer)
- Validation criteria per step
- HITL checkpoints
- Entry point commands (`/qa-workflow`, `/qa-workflow-dev`)

## Understand the Learning Cycle

```
Agent executes step
    │
    ├── VALIDATES per step criteria
    ├── TEACHES on success/failure
    ├── LEARNS via /kernel/learn
    └── APPLIES lessons next run
```

## Action

List all workflows and their entry points. These will be indexed in the protocol.
