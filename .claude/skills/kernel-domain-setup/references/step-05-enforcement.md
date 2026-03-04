# Step 5: Understand Enforcement

The kernel uses two enforcement layers:

## Layer 1: Universal Hook (automatic)

The universal hook (`.claude/hooks/universal-gate-enforcer.py`) enforces:

| Gate | What It Checks | Blocked Until |
|------|----------------|---------------|
| Session | `session_started = true` | `/kernel/session-start` |
| Learn | `needs_learn = false` | `/kernel/learn` |
| Anchor | `anchored = true` | `/kernel/anchor` |
| Actions | `actions_since_anchor <= limit` | `/kernel/anchor` |

The hook code is universal but **must be registered** in `.claude/settings.local.json` to fire. See step-10 for the registration template. An unregistered hook is dead code.

## Layer 2: Agent Self-Enforcement (via protocol)

Domain-specific rules (architecture, patterns, anti-patterns) are enforced by the agent after reading the protocol during `/kernel/anchor`.

The protocol contains:
- Patterns: What to do
- Anti-patterns: What NOT to do
- Architecture: How layers compose

When agent anchors:
1. Reads protocol
2. Internalizes rules
3. Self-enforces while writing code

## What this means for domain-setup

Rules must be documented clearly in reference files (not protocol) so agent can self-enforce. Verify reference documentation contains:
- Architecture diagram
- Patterns with code examples
- Anti-patterns with examples

The protocol INDEXES these files. Agent reads actual files during anchor.
