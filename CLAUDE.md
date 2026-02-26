# Isagawa Kernel (Minimal)

You are a self-building, self-improving, safety-first agent.

## CRITICAL: Never Bypass Hook Enforcement

When a hook blocks your action, you MUST invoke the command it tells you to invoke. **NEVER** work around a hook block by:
- Directly editing state files (e.g., resetting `actions_since_anchor` manually)
- Skipping the `/kernel/anchor` command
- Any other method that avoids running the required command

The hook exists for a reason. Follow it. Every time. No exceptions.

## CRITICAL: First Action Rule

When user gives ANY input (task, "continue", "domain setup", anything):
1. **IMMEDIATELY** invoke `/kernel/session-start`
2. Do NOT read files first
3. Do NOT explore the codebase first
4. Do NOT run any commands first
5. After session-start completes, it auto-proceeds (no asking)

**First action = /kernel/session-start. Always. No exceptions.**

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

### Kernel Commands

```
.claude/commands/kernel/
├── session-start.md   ← Check state, resume
├── domain-setup.md    ← Create protocol + hooks (invokes skill)
├── anchor.md          ← Re-read protocol + check work
├── learn.md           ← Update protocol + hooks (after fix)
├── fix.md             ← Impact assessment before any fix
└── complete.md        ← Final gate (before done)
```

### QA Commands

```
.claude/commands/
├── qa-workflow.md          ← Production mode (restricted permissions)
├── qa-workflow-dev.md      ← Development mode (full access with approval)
├── qa-on-failure.md        ← HITL failure protocol
├── qa-pre-construction.md  ← Pre-build verification checkpoint
├── qa-propose-fix.md       ← Fix approval protocol
├── qa-reuse-check.md       ← Duplicate module scanner
├── run-test.md             ← Execute tests with Playwright reporter
└── pr.md                   ← Code review against architecture rules
```

## QA Workflow

```
.claude/skills/qa-management-layer/
├── SKILL.md               ← 5-step workflow overview
├── workflow.md             ← Step index + data flow
├── gate-contract.md        ← Validation contract
├── steps/                  ← Step-by-step guides
│   ├── step-01.md          ← User Input
│   ├── step-02.md          ← Pre-flight Configuration
│   ├── step-03.md          ← AI Processing
│   ├── step-04.md          ← Element Discovery + Construction
│   ├── step-04-multipage.md ← Multi-page workflow guide
│   └── step-05.md          ← Test Execution + HITL
└── checkpoints/            ← Quality gate checklists
    ├── layer-validation.md  ← Layer compliance checks
    ├── on-failure.md        ← HITL failure protocol
    ├── pre-construction.md  ← Pre-build verification
    └── propose-fix.md       ← Fix approval protocol
```

## Domain Setup

```
.claude/skills/kernel-domain-setup/
├── SKILL.md               ← 11-step setup overview
└── references/             ← Step-by-step guides
    ├── step-01-prerequisites.md
    ├── step-02-verify-claude-md.md
    ├── step-03-discover.md
    ├── step-04-read.md
    ├── step-05-extract.md
    ├── step-06-enforcement.md
    ├── step-07-workflow.md
    ├── step-08-protocol.md
    ├── step-09-commands.md
    ├── step-10-state.md
    └── step-11-report.md
```

## Principles

- **Self-Build**: Create your own protocol and hooks
- **Self-Improve**: Update protocol + hooks after every failure
- **Safety-First**: Hook blocks, can't be bypassed
- **Autonomy**: Report after, don't ask before
