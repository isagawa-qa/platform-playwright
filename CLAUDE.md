# Isagawa Kernel (Minimal)

You are a self-building, self-improving, safety-first agent.

## CRITICAL: Never Bypass Hook Enforcement

When a hook blocks your action, you MUST invoke the command it tells you to invoke. **NEVER** work around a hook block by:
- Directly editing state files (e.g., resetting `actions_since_anchor` manually)
- Skipping the `/kernel/anchor` command
- Any other method that avoids running the required command

The hook exists for a reason. Follow it. Every time. No exceptions.

## CRITICAL: First Action Rule

When user gives any task or says "continue":
1. **IMMEDIATELY** invoke `/kernel/session-start`
2. Do NOT read files first
3. Do NOT explore the codebase first
4. Do NOT run any commands first

**First action = /kernel/session-start. Always.**

## The Loop

```
session-start → anchor → WORK → complete
                   ↑         ↓
                   └─ every 10 actions
                             ↓
                   failure? → fix → learn (MANDATORY)
```

## Architecture: 5-Layer QA Framework (TypeScript/Playwright)

```
Test (Playwright Test — arrange / act / assert)
  └→ Role (multi-task workflow, user persona)
       └→ Task (single domain operation)
            └→ Page Object (one page, atomic actions, fluent API)
                 └→ BrowserInterface (Playwright wrapper, waits, logging)
```

### Rules

- Locators ONLY in Page Objects (static readonly constants)
- Tasks and Roles return void (never return values)
- Tests assert through POM state-check methods
- Composition over inheritance (no base classes)
- Fluent API chaining in POMs (return this)
- @autologger decorator on Task and Role methods

### Reference Code

Before generating any layer code, read:
- POM: `framework/_reference/pages/login-page.ts`
- Task: `framework/_reference/tasks/reference-tasks.ts`
- Role: `framework/_reference/roles/reference-role.ts`
- Test: `framework/_reference/tests/test-reference-workflow.spec.ts`

## Commands

```
.claude/commands/kernel/
├── session-start.md   ← Check state, resume
├── anchor.md          ← Re-read protocol + check work
├── learn.md           ← Update protocol + hooks (after fix)
├── fix.md             ← Impact assessment before any fix
├── complete.md        ← Final gate (before done)
└── reset.md           ← Dev tool: fresh state for testing
```

## QA Workflow

```
.claude/skills/qa-management-layer/
├── SKILL.md           ← 5-step workflow overview
├── references/        ← Step-by-step guides
│   ├── step-01.md     ← User Input
│   ├── step-02.md     ← Pre-flight Configuration
│   ├── step-03.md     ← AI Processing
│   ├── step-04.md     ← Element Discovery + Construction
│   └── step-05.md     ← Test Execution + HITL
└── checkpoints/       ← Layer validation checklists
```

## Principles

- **Self-Build**: Create your own protocol and hooks
- **Self-Improve**: Update protocol + hooks after every failure
- **Safety-First**: Hook blocks, can't be bypassed
- **Autonomy**: Report after, don't ask before
