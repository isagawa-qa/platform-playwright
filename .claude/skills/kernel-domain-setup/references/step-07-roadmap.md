# Step 7: Initialize Task Queue

Create the `tasks/` directory for the cycling workflow.

**IMPORTANT:** `tasks/` is the work queue directory. NOT `specs/`. "Spec" means domain specification (the skill folder). "Tasks" means numbered work items the agent cycles through.

## Purpose

The cycling workflow processes tasks in numerical order from `tasks/`. Domain-setup creates this directory as part of infrastructure. The user populates it with work items — either before or after domain-setup.

## Process

1. **Check if `tasks/` exists:**
   - If yes AND contains `.md` files: report "Found N existing tasks in tasks/. Using existing work queue." and SKIP to state update.
   - If yes but empty: report "tasks/ exists but is empty. User will populate before cycling."
   - If no: create the directory. Report "Created tasks/ directory."

2. **Do NOT generate task files.** Domain-setup builds infrastructure (protocol, hooks, state). The work queue is user input, not domain-setup output.

## Task File Format (Reference)

When the user creates task files, they should follow this format:

```markdown
# [Task Title]

## Context
[Why this task exists and how it fits the domain]

## Requirements
- [Specific requirement 1]
- [Specific requirement 2]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Completion Signal
When all acceptance criteria are met, invoke `/kernel/complete`.
```

## Output

```
tasks/
├── 001-[first-task].md
├── 002-[second-task].md
├── 003-[third-task].md
└── ...
```

## Rules

- **Each task is self-contained** — includes enough context to implement without reading other tasks
- **Acceptance criteria are testable** — not vague ("works well") but specific ("returns 200 on GET /api/users")
- **Completion signal** — every task ends with "invoke `/kernel/complete`"

## State Update

After initializing the task queue, update workflow state with task count (see step-10).
