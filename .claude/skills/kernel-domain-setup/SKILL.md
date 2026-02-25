# Kernel Domain Setup

Set up QA Test Automation domain enforcement by discovering and indexing repo content.

## Overview

This skill guides the agent through setting up domain-specific enforcement for the QA test automation framework. It creates an indexed protocol, wraps commands for kernel loop enforcement, and establishes the self-improvement infrastructure.

## Steps

| Step | Action | Reference |
|------|--------|-----------|
| 1 | Verify prerequisites | → `references/step-01-prerequisites.md` |
| 2 | Verify CLAUDE.md | → `references/step-02-verify-claude-md.md` |
| 3 | Discover repo structure | → `references/step-03-discover.md` |
| 4 | Read reference code | → `references/step-04-read.md` |
| 5 | Extract patterns | → `references/step-05-extract.md` |
| 6 | Understand enforcement | → `references/step-06-enforcement.md` |
| 7 | Read workflow | → `references/step-07-workflow.md` |
| 8 | Build protocol | → `references/step-08-protocol.md` |
| 9 | Wrap commands | → `references/step-09-commands.md` |
| 10 | Update state | → `references/step-10-state.md` |
| 11 | Report & restart | → `references/step-11-report.md` |

## Execution

1. **Check for resume state:**
   - Read `.claude/state/session_state.json`
   - If `resume_step` exists, skip to that step
   - Clear `resume_step` after reading

2. **Execute steps sequentially:**
   - Read each reference file before executing that step
   - If restart needed mid-skill, set `resume_step` in state

## Key Principles

- **Protocol = Index** — Point to files, don't duplicate content
- **200-line threshold** — Split files when they exceed this
- **Dynamic categories** — Create new folders for emerging content
- **Self-improvement** — Lessons learned accumulate via `/kernel/learn`

## Outcome

After completion:
- Protocol created at `.claude/protocols/qa-protocol.md`
- Lessons folder at `.claude/lessons/`
- Commands wrapped for kernel loop enforcement
- State files updated
- **Restart required** for hooks to load
