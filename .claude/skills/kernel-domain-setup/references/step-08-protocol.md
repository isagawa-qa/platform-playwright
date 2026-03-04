# Step 7: Build Protocol

Create `.claude/protocols/[domain]-protocol.md` as a **pure index** (no content duplication).

## Use Confirmed References

Build the protocol using the reference files confirmed by user in Step 3. The protocol indexes these actual files - don't use placeholder paths.

## Protocol Template

```markdown
# [Domain] Protocol

**Domain:** [domain]
**Type:** Indexed
**Created:** [timestamp]

---

## References

### Code Patterns
| Category | Reference |
|----------|-----------|
| [category] | `[confirmed_reference_path]` |
| [category] | `[confirmed_reference_path]` |

*These are the files confirmed in Step 3 as canonical examples.*

### Architecture + Patterns
→ `[confirmed_architecture_doc_if_exists]`

### Workflow (if applicable)
| File | Purpose |
|------|---------|
| `.claude/skills/[domain]-*/SKILL.md` | Entry point |

### Entry Points
| Command | Purpose |
|---------|---------|
| `/[command]` | [description] |

### Lessons Learned
→ `.claude/lessons/lessons.md`

---

*Protocol is an INDEX. Agent reads referenced files during /kernel/anchor.*
```

## Key Principle

The protocol points to **actual files that exist** - the ones user confirmed as good references. Don't create placeholder sections for things that don't exist in this repo.

## How Commands Execute via Protocol

When user types `/[command]`:

```
1. Command wrapper invokes /kernel/anchor
2. Anchor reads this protocol
3. Protocol points to reference files
4. Agent reads actual files
5. Agent executes, self-enforcing patterns from references
6. On failure: /kernel/learn captures lesson
7. On success: /kernel/complete resets counter
```

## Critical Rules

- Do NOT copy code examples into protocol
- Do NOT duplicate content
- Only index files that actually exist
- Agent reads actual reference files during `/kernel/anchor`
- This keeps protocol small and prevents drift

## Create Lessons Folder

```
.claude/lessons/
└── lessons.md
```

Initialize `.claude/lessons/lessons.md` with:

```markdown
# Lessons Learned

*Accumulated knowledge from workflow failures. Updated by /kernel/learn.*

---

*(Empty - filled by /kernel/learn)*
```

---

## Step 7b: Adaptive Indexing Rule

**Threshold: 200 lines**

When any referenced file exceeds 200 lines:
1. Convert file to indexed folder
2. Split content into logical chunks
3. Create index file pointing to chunks
4. Update parent reference

---

## Step 7c: Dynamic Category Creation

When content doesn't fit existing categories:

1. Create new folder under `.claude/` with descriptive name
2. Create initial file (e.g., `.claude/[category]/[category].md`)
3. Update protocol to add new reference
4. Apply 200-line rule

**Naming convention:**
- Folder: lowercase, hyphens (e.g., `edge-cases`)
- File: same as folder (e.g., `edge-cases.md`)
- Protocol section: Title Case (e.g., `### Edge Cases`)
