# /kernel/fix

Run impact assessment before implementing any fix to kernel components.

## Usage

```
/kernel/fix the hook isn't blocking correctly
/kernel/fix session-start creates new domain when one exists
/kernel/fix
```

## Instructions

### Step 1: Understand the Fix

If `$ARGUMENTS` provided, that's the fix description.
If empty, ask user: "What needs to be fixed?"

### Step 2: Log Defect

Before analysis, log in `DEFECT_LOG.md`:
- DEF-XXX with brief description
- Date, severity, status: OPEN
- What happened, expected vs actual

### Step 3: Impact Assessment (MANDATORY)

Before writing ANY code, complete ALL four:

#### 3.1 Who calls this code?

```bash
grep -r "function_or_file_name" .claude/ docs/
```

Show all callers/references found.

#### 3.2 What depends on current behavior?

- List commands that use this
- List hooks that check this
- List state files affected

#### 3.3 What will break?

Explicit list:
- Commands affected
- Hooks affected
- State contracts broken

If nothing, state: "No breaking changes identified"

#### 3.4 Migration path?

- Backward compatible? Yes/No + why
- Existing state handling needed?

### Step 4: Present Assessment

```
## Impact Assessment: [Fix description]

### 1. Callers
- `command.md:N` - references this
- `hook.py:N` - checks this

### 2. Dependencies
- Commands: X, Y, Z
- Hooks: A, B
- State: field_name in workflow.json

### 3. What Breaks
- [item] - reason
- (or "None identified")

### 4. Migration
- Backward compatible: Yes/No
- Reason: [explanation]

**Proceed with fix?**
```

### Step 5: Wait for Approval

Do NOT implement until user explicitly approves.

### Step 6: Implement Fix

After approval:
1. Make the changes
2. Update any dependent commands/hooks
3. Update DEFECT_LOG.md with resolution

### Step 7: Invoke /kernel/learn

After fix is complete:
1. Record the lesson in protocol
2. Add anti-pattern if applicable
3. Update hooks if enforceable

## When to Invoke

- Before ANY fix to kernel components
- Before ANY fix to hooks
- Before ANY fix to commands
- Before ANY change to state contracts
