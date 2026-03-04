# /kernel/domain-setup

Create complete enforcement for a new domain. Invoke when starting work in a new domain.

## Instructions

This command uses a skill-based approach with 11 modular steps.

### Load Skill

Read and follow: `.claude/skills/kernel-domain-setup/SKILL.md`

### Resume Support

If resuming after restart (check `resume_step` in session_state.json):
- Skip to the step number indicated
- Continue from there

### Quick Reference

| Step | Action |
|------|--------|
| 1 | Verify prerequisites |
| 2 | Discover repo structure |
| 3 | Read reference code |
| 4 | Extract patterns |
| 5 | Understand enforcement |
| 6 | Read workflow |
| 7 | Build roadmap |
| 8 | Build protocol |
| 9 | Wrap commands |
| 10 | Update state |
| 11 | Report & restart |

### Key Principles

- **Protocol = Index** — Point to files, don't duplicate content
- **200-Line Threshold** — Extract to sub-files when sections grow
- **Two-Tier Enforcement** — Hooks (hard) + Protocol (soft)
- **Restart Required** — New hooks load at Claude Code startup

### Domain Name Normalization

Domain name MUST be normalized:
- Lowercase
- Replace hyphens with underscores
- Remove special characters

Example: `my-project` → `my_project`
