# Step 1: Prerequisites

Before domain setup, verify all dependencies are installed and configured.

## MCP Servers (if applicable)

Check if configured in `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "[server-name]": {
      "command": "...",
      "args": ["..."]
    }
  }
}
```

**If not configured:**
1. Create/update `.claude/mcp.json` with required config
2. Set restart state (see below)
3. Stop and wait for restart

## Dependencies

Check for dependency files and install:

| File | Action |
|------|--------|
| `package.json` | `npm install` |
| `requirements.txt` | `pip install -r requirements.txt` |
| `go.mod` | `go mod download` |
| `Cargo.toml` | `cargo build` |

## Settings

Verify `.claude/settings.local.json` has MCP servers enabled (if using MCP):

```json
{
  "enableAllProjectMcpServers": true
}
```

## Checklist

| Dependency | Check | Action if Missing |
|------------|-------|-------------------|
| MCP servers | `.claude/mcp.json` configured | Add config → restart |
| Dependencies | Package manager files exist | Install dependencies |
| MCP enabled | settings.local.json configured | Add enableAllProjectMcpServers |

---

## Restart Flow (Integration with Session-Start Loop)

If ANY MCP configuration changed, restart is required. MCP servers load at Claude Code startup.

### Step 1a: Set Restart State

Create/update `.claude/state/session_state.json`:

```json
{
  "session_started": true,
  "domain": "[domain]",
  "needs_restart": true,
  "resume_after_restart": "domain-setup",
  "resume_step": 2,
  "timestamp": "[ISO-8601]"
}
```

### Step 1b: Report and Stop

```
PREREQUISITES: Restart Required

Changed:
- [list what was configured/changed]

State saved. After restart, domain-setup will resume from Step 2.

⚠️  RESTART REQUIRED

1. Restart Claude Code now
2. Say "continue"
3. /kernel/session-start will read state and resume

Waiting for restart...
```

**STOP. Do not proceed until user restarts.**

### Step 1c: After Restart (Handled by session-start)

When user says "continue":
1. `/kernel/session-start` reads state
2. Sees `needs_restart: true` → clears flag
3. Sees `resume_after_restart: "domain-setup"`
4. Invokes `/kernel/domain-setup`
5. Domain-setup sees `resume_step: 2` → skips to Step 2

---

## No Restart Needed

If all dependencies already configured:

```
PREREQUISITES: All configured

✓ Dependencies installed
✓ MCP configured (if applicable)
✓ Settings configured

Proceeding to Step 2...
```

Continue to Step 2 immediately.
