# Step 11: Report & Restart

## Report Format

```
DOMAIN SETUP COMPLETE: qa

Indexed:
├── Reference code: [X] files
├── Infrastructure: [X] files
├── Workflow: [X] skill steps
├── Test setup: [X] files
└── Entry points: [X] commands

Wrapped Commands: [X] commands now run within kernel loop

Protocol: .claude/protocols/qa-protocol.md

RESTART REQUIRED

Restart Claude Code, then say "continue".
```

## Why Restart Required

Hooks are loaded at Claude Code startup. New hooks and state files require restart to take effect.

## After Restart

User says "continue". Agent:
1. Reads `session_state.json` → sees `resume_after_restart: "anchor"`
2. Invokes `/kernel/anchor`
3. Reads protocol, internalizes rules
4. Ready for work

## Critical

**STOP. Do not proceed until user restarts and says "continue".**
