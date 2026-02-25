# Step 9: Wrap Commands

Discovered commands (from Step 7) must run within the kernel loop for self-improvement and anchor-on-drift.

## Process

For each non-kernel command found in `.claude/commands/`:

1. Read the original command file
2. Create a wrapped version that enforces the kernel loop

## Wrapper Structure

Each wrapped command follows this pattern:

```
┌─────────────────────────────────────────────┐
│ Step 1: Anchor (REQUIRED)                   │
│   → Invoke /kernel/anchor                   │
│   → Wait for confirmation                   │
│   → If fails: resolve before proceeding     │
├─────────────────────────────────────────────┤
│ Step 2: Execute Workflow                    │
│   → Read protocol → Workflow section        │
│   → Execute each step as documented         │
│   → On failure: STOP → /kernel/learn → retry│
├─────────────────────────────────────────────┤
│ Step 3: Complete                            │
│   → Invoke /kernel/complete                 │
│   → Resets action counter                   │
└─────────────────────────────────────────────┘
```

## Why This Matters

- **Anchor** ensures agent reads protocol (pattern enforcement)
- **Learn** captures failures (self-improvement)
- **Complete** resets action counter (drift detection)

## Apply to All Commands

| Original | Wrapped |
|----------|---------|
| `/qa-workflow` | Anchor → Execute from protocol → Complete |
| `/qa-workflow-dev` | Anchor → Execute from protocol → Complete |
| `/run-test` | Anchor → Execute from protocol → Complete |

## Rules

- Keep original workflow logic in protocol (not duplicated in command)
- Command becomes thin invocation layer
- All enforcement happens via kernel loop
