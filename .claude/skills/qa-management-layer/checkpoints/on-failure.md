# On-Failure Checkpoint

**Invoke:** When ANY test failure, error, or unexpected behavior occurs

---

## STOP — Do Not Attempt Autonomous Fixes

You have encountered a failure. **DO NOT** try to fix it autonomously.

---

## MANDATORY: Report to User

Present this to the user:

```
FAILURE DETECTED
================

Step: [Current step number]
Error: [Error message or failure description]
File: [File path if applicable]
Line: [Line number if applicable]

WHAT HAPPENED:
[Brief description of what you were attempting]

WHAT I OBSERVED:
[Exact error, stack trace, or unexpected behavior]

---

HOW SHOULD WE PROCEED?

1. AI Proposes Fix
   → I will show my proposed fix for your approval
   → You approve before I apply it

2. User Provides Fix
   → Tell me what to change
   → I apply your fix

3. Investigate Further
   → I gather more information
   → Report back before any changes

4. Skip This Test
   → Mark as known issue
   → Continue with next test

5. Stop Workflow
   → End session
   → Document current state

Enter choice (1-5):
```

---

## CRITICAL RULES

### What You MUST NOT Do:

- Do not try "one more thing" without asking
- Do not loop through multiple fix attempts
- Do not assume you know the right solution
- Do not proceed without user confirmation

### What You MUST Do:

- STOP immediately
- Show the failure report above
- WAIT for user response
- Only proceed based on user choice

---

## After User Responds

- **Option 1:** Invoke `/qa-propose-fix` checkpoint before applying
- **Option 2:** Apply user's fix, re-run test
- **Option 3:** Gather info, report back, wait again
- **Option 4:** Document skip reason, continue
- **Option 5:** Save state, end workflow

---

## MANDATORY: After Fix Passes

When the test passes after applying a fix:

```
1. Invoke /kernel/learn
2. Record the lesson (what failed, why, how fixed)
3. Then continue with workflow
```

**Flow:**
```
failure → HITL → fix → re-run → PASS? → /kernel/learn → continue
                              ↓
                            FAIL? → back to HITL
```

**Never skip learning. Every fix creates a lesson.**

---

**Never skip this checkpoint. HITL is mandatory.**
