# Propose-Fix Checkpoint

**Invoke:** Before applying ANY fix (when user selected "AI Proposes Fix")

---

## STOP — Show Fix Before Applying

You are about to propose a fix. **DO NOT** apply it until user approves.

---

## MANDATORY: Present Proposed Fix

Show this to the user:

```
PROPOSED FIX
============

File: [exact file path]
Line: [line number(s)]

CURRENT CODE:
[exact current code — copy from file]

PROPOSED CHANGE:
[exact new code you will write]

WHY THIS FIX:
[Brief explanation of why this change fixes the issue]

RISK ASSESSMENT:
- Impact: [What else might this affect?]
- Reversible: [Yes/No]
- Tests affected: [List any]

---

APPROVE THIS FIX?

1. Yes — Apply this fix
2. No — Let me try something else
3. Modify — Apply with changes (describe)

Enter choice (1-3):
```

---

## CRITICAL RULES

### Before Showing Fix:

1. **READ the current file** — Do not work from memory
2. **COPY exact current code** — No paraphrasing
3. **SHOW exact proposed change** — Character for character

### After User Responds:

- **Option 1 (Yes):** Apply fix, re-run test, report result
- **Option 2 (No):** Return to on-failure checkpoint, ask what to try
- **Option 3 (Modify):** Apply user's version, re-run test

---

## What You MUST NOT Do

- Do not apply fix without showing it first
- Do not paraphrase or summarize code changes
- Do not skip the approval step
- Do not assume "yes" without explicit approval

---

## After Fix Applied

1. Re-run the test
2. If passes: Continue workflow
3. If fails: Invoke `/qa-on-failure` again

**Never apply fixes without explicit user approval.**
