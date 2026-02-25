# Step 1: Prerequisites

Before domain setup, verify all dependencies are installed and configured.

## Playwright MCP (Element Discovery)

This platform uses the **Playwright MCP** for element discovery during the QA workflow (Step 4). The agent uses MCP tools to navigate pages, inspect the accessibility tree, and extract selectors.

Check if configured in `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**If not configured:**
1. Create `.claude/mcp.json` with the config above
2. Verify `.claude/settings.local.json` has:
   ```json
   {
     "enableAllProjectMcpServers": true,
     "enabledMcpjsonServers": ["playwright"]
   }
   ```
3. Set restart state (see Restart Flow below)
4. Stop and wait for restart

## Node Dependencies

Check `node_modules/` exists and has required packages:

- `@playwright/test` — Test runner
- `@faker-js/faker` — Test data generation

If missing: `npm install`

## Playwright Browsers

Verify browsers are installed (needed for MCP, test execution, headed runs):

If missing: `npx playwright install`

## Checklist

| Dependency | Check | Action if Missing |
|------------|-------|-------------------|
| Playwright MCP | `.claude/mcp.json` has playwright | Create config → restart |
| MCP enabled | `settings.local.json` has enableAllProjectMcpServers | Add setting → restart |
| Node deps | `node_modules/@playwright/test` exists | `npm install` |
| Browsers | Playwright browsers installed | `npx playwright install` |

---

## Restart Flow

If MCP configuration was created or changed, restart is required. MCP servers load at Claude Code startup.

### Set Restart State

Update `.claude/state/session_state.json`:

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

### Report and Stop

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

---

## All Configured (No Restart)

If everything is already in place:

```
PREREQUISITES: All configured

- Playwright MCP configured
- Node dependencies installed
- Browsers installed

Proceeding to Step 2...
```

Continue to Step 2 immediately.
