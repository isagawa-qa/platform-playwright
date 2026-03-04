# Step 10: Update State

## Session State

Create/update `.claude/state/session_state.json`:

```json
{
  "session_started": true,
  "domain": "[domain]",
  "timestamp": "[ISO-8601]",
  "needs_restart": true,
  "resume_after_restart": "anchor"
}
```

## Workflow State

Create `.claude/state/[domain]_workflow.json`:

```json
{
  "domain": "[domain]",
  "setup_complete": true,
  "protocol_created": true,
  "protocol_path": ".claude/protocols/[domain]-protocol.md",
  "anchored": false,
  "actions_since_anchor": 0,
  "actions_limit": 10,
  "timestamp": "[ISO-8601]"
}
```

## Hook Registration

Create/update `.claude/settings.local.json` to register hooks:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/hooks/universal-gate-enforcer.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/hooks/test-failure-detector.py"
          }
        ]
      }
    ]
  }
}
```

**MERGE rule:** If `settings.local.json` already exists, merge the `hooks` key into it. Do NOT overwrite existing keys like `permissions`.

## Commit Domain-Setup Output

Before setting `needs_restart`, commit all domain-setup artifacts:

```bash
git add .claude/protocols/ .claude/lessons/ .claude/state/ tasks/
git add .claude/commands/ .claude/hooks/ .claude/skills/ .claude/settings.local.json
# Add any framework files, commands, or configs created during setup
git commit -m "feat: domain-setup output for [domain]"
```

This ensures the project starts clean on restart — no untracked domain-setup files.

## State Fields

| Field | Purpose |
|-------|---------|
| `session_started` | Session initialized |
| `domain` | Active domain name |
| `needs_restart` | Hooks require restart |
| `resume_after_restart` | What to do after restart |
| `anchored` | Protocol read this session |
| `actions_since_anchor` | Counter (auto-incremented by hook) |
| `actions_limit` | Threshold before re-anchor required |
