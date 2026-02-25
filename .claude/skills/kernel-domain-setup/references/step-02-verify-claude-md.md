# Step 2: Verify CLAUDE.md

Verify the kernel instruction file exists and has the required sections. This file drives the entire kernel — without it, the agent has no instructions.

## Check

Read `CLAUDE.md` at the project root.

### If CLAUDE.md exists:

Verify these **required sections** are present:

| Section | Purpose |
|---------|---------|
| `## CRITICAL: Never Bypass Hook Enforcement` | Prevents agent from editing state files directly |
| `## CRITICAL: First Action Rule` | Ensures `/kernel/session-start` is always first |
| `## The Loop` | Defines session-start → anchor → WORK → complete cycle |
| `## Commands` | Lists available kernel commands |
| `## Principles` | Self-build, self-improve, safety-first, autonomy |

**If any section is missing:**
- Add the missing section(s)
- Report what was added

### If CLAUDE.md does NOT exist:

Create it using the kernel template from the sr_dev_test workspace.

## Report

```
CLAUDE.MD: [Created | Verified | Updated]

Sections: [all present | added: list]

Proceeding to Step 3...
```
