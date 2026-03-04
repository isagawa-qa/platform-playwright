# Step 6: Read Workflow

Read workflow skill files to understand command execution:

| File | Extract |
|------|---------|
| `.claude/skills/[domain]-*/SKILL.md` | Workflow entry point, philosophy |
| `.claude/skills/[domain]-*/workflow.md` | Step index, data flow |
| `.claude/skills/[domain]-*/steps/*.md` | Step-specific criteria |

## Identify

- Workflow steps (if defined)
- Validation criteria per step
- HITL checkpoints
- Entry point commands

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
