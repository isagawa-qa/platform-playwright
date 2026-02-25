# Step 10: Update State

## Session State

Create/update `.claude/state/session_state.json`:

```json
{
  "session_started": true,
  "domain": "qa",
  "timestamp": "[ISO-8601]",
  "needs_restart": true,
  "resume_after_restart": "anchor"
}
```

## Workflow State

Create `.claude/state/qa_workflow.json`:

```json
{
  "domain": "qa",
  "setup_complete": true,
  "protocol_created": true,
  "protocol_path": ".claude/protocols/qa-protocol.md",
  "anchored": false,
  "actions_since_anchor": 0,
  "actions_limit": 10,
  "timestamp": "[ISO-8601]"
}
```

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
