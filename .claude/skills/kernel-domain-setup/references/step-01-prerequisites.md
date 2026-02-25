# Step 1: Prerequisites

Before domain setup, verify all dependencies are installed and configured.

## Playwright MCP (Required)

Check if configured in `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp"]
    }
  }
}
```

**If not configured:**
1. Create/update `.claude/mcp.json` with above config
2. Set restart state (see below)
3. Stop and wait for restart

## Node Dependencies

Check `package.json` exists and install:

```bash
npm install
```

### Required packages:
- @playwright/test
- @faker-js/faker

## Playwright Browsers

Verify Playwright browsers are installed:

```bash
npx playwright install
```

## Settings

Verify `.claude/settings.local.json` has MCP servers enabled:

```json
{
  "enableAllProjectMcpServers": true
}
```

## Checklist

| Dependency | Check | Action if Missing |
|------------|-------|-------------------|
| Playwright MCP | `.claude/mcp.json` has playwright | Add config → restart |
| Node deps | `package.json` has @playwright/test | `npm install` |
| Browsers | Playwright browsers installed | `npx playwright install` |
| MCP enabled | settings.local.json configured | Add enableAllProjectMcpServers |

---

## Restart Flow (Integration with Session-Start Loop)

If ANY MCP configuration changed, restart is required. MCP servers load at Claude Code startup.

### Step 1a: Set Restart State

Create/update `.claude/state/session_state.json`:

```json
{
  "session_started": true,
  "domain": "qa",
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

RESTART REQUIRED

1. Restart Claude Code now
2. Say "continue"
3. /kernel/session-start will read state and resume

Waiting for restart...
```

**STOP. Do not proceed until user restarts.**

## No Restart Needed

If all dependencies already configured:

```
PREREQUISITES: All configured

- Playwright MCP configured
- Node dependencies installed
- Playwright browsers available
- MCP enabled in settings

Proceeding to Step 2...
```

Continue to Step 2 immediately.
