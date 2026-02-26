# Step 1: Prerequisites

Before domain setup, verify ALL dependencies are installed and configured.

**CRITICAL: Check EVERY item below independently. Do NOT assume one check passing means others are fine. Do NOT skip any check.**

---

## Check 1: Playwright MCP Configuration (`mcp.json`)

Read `.mcp.json` (project root) and verify it contains:

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

**If missing or misconfigured:** Create/fix the file with the config above. Mark `needs_restart = true`.

---

## Check 2: MCP Enablement in Settings (`settings.local.json`)

Read `.claude/settings.local.json` and verify it has **ALL** of these fields:

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["playwright"]
}
```

**Check independently from Check 1.** Even if `mcp.json` exists, the MCP server will NOT load without these settings.

**If missing:** Add the fields to `settings.local.json` (merge, don't overwrite). Mark `needs_restart = true`.

---

## Check 3: Permissions in Settings (`settings.local.json`)

Verify `.claude/settings.local.json` has these permissions:

```json
{
  "permissions": {
    "allow": [
      "Skill(kernel:*)",
      "WebSearch",
      "Bash(npx @playwright/mcp@latest --help)"
    ]
  }
}
```

**If missing:** Add/merge permissions. Mark `needs_restart = true`.

---

## Check 4: Hook Matcher in Settings (`settings.local.json`)

Verify the hook matcher includes `Bash`:

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
    ]
  }
}
```

**The matcher MUST be `Edit|Write|Bash`** (not just `Edit|Write`). Without `Bash`, the hook won't track Bash actions toward the anchor counter.

**If wrong:** Fix the matcher. Mark `needs_restart = true`.

---

## Check 5: Node Dependencies

Check `node_modules/` exists and has required packages:

- `@playwright/test` — Test runner
- `@faker-js/faker` — Test data generation

**If missing:** `npm install`

---

## Check 6: Playwright Browsers

Verify browsers are installed (needed for MCP, test execution, headed runs).

**If missing:** `npx playwright install`

---

## Checklist Summary

| # | Check | File | What to Verify | Action if Wrong |
|---|-------|------|----------------|-----------------|
| 1 | MCP config | `.mcp.json` (project root) | Has `playwright` server entry | Create/fix → restart |
| 2 | MCP enabled | `.claude/settings.local.json` | Has `enableAllProjectMcpServers` + `enabledMcpjsonServers` | Add fields → restart |
| 3 | Permissions | `.claude/settings.local.json` | Has `Skill(kernel:*)`, `WebSearch`, MCP bash | Add permissions → restart |
| 4 | Hook matcher | `.claude/settings.local.json` | Matcher is `Edit\|Write\|Bash` | Fix matcher → restart |
| 5 | Node deps | `node_modules/` | `@playwright/test`, `@faker-js/faker` exist | `npm install` |
| 6 | Browsers | Playwright browsers | Installed | `npx playwright install` |

---

## Restart Decision

**If ANY check required a fix that changes `.mcp.json` (project root) or `.claude/settings.local.json`:**

MCP servers and hooks load at Claude Code startup. Changes to these files require a restart.

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

Fixed:
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

## All Checks Pass (No Restart Needed)

If every check passed without changes:

```
PREREQUISITES: All configured

- [1] Playwright MCP config: OK
- [2] MCP enablement in settings: OK
- [3] Permissions: OK
- [4] Hook matcher: OK
- [5] Node dependencies: OK
- [6] Browsers: OK

Proceeding to Step 2...
```

Continue to Step 2 immediately.
