# /kernel/reset

Reset repo for fresh kernel test. Use during iteration/development.

## What Gets Removed

- `.claude/state/*` - All state files
- `.claude/protocols/*` - All protocols (agent-created)
- `.claude/hooks/*` - All hooks EXCEPT `universal-gate-enforcer.py`
- `.claude/commands/*.md` - Root-level domain commands (NOT kernel/*)

## What Stays (Pre-installed)

- `.claude/commands/kernel/*` - All kernel commands
- `.claude/hooks/universal-gate-enforcer.py` - Pre-installed hook
- `.claude/settings.json` - Base settings
- `CLAUDE.md` - The loop
- `docs/design/*` - Design docs
- `docs/DEFECT_LOG.md` - Defect tracking

## Instructions

### Step 1: Remove agent-created files

```bash
# Remove state files
rm -f .claude/state/*

# Remove protocols
rm -f .claude/protocols/*

# Remove domain hooks (keep universal)
find .claude/hooks -type f ! -name "universal-gate-enforcer.py" -delete

# Remove domain commands at root level (keep kernel folder)
find .claude/commands -maxdepth 1 -type f -name "*.md" -delete
```

### Step 2: Reset settings.local.json

Overwrite `.claude/settings.local.json` with:

```json
{
  "permissions": {
    "allow": []
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {"type": "command", "command": "python .claude/hooks/universal-gate-enforcer.py"}
        ]
      }
    ]
  }
}
```

### Step 3: Verify

```bash
# Should show 9 kernel commands
ls .claude/commands/kernel/ | wc -l

# Should show only universal hook
ls .claude/hooks/

# Should show empty (or just . and ..)
ls .claude/state/

# Should show empty
ls .claude/protocols/
```

## Report

```
KERNEL RESET

Removed:
- State files: [count]
- Protocols: [count]
- Domain hooks: [count]
- Domain commands: [count]
- settings.local.json: Reset to universal hook only

Verified:
- Kernel commands: OK (9 files)
- Universal hook: OK
- Design docs: OK
- CLAUDE.md: OK

Ready for fresh /kernel/session-start
```
