# Step 3: Read Reference Code

Identify and confirm reference files to use as pattern examples.

## Why References Matter

You MUST have reference code to build an accurate protocol. Without examples:
- Patterns are guessed, not observed
- Anti-patterns can't be identified
- Protocol will drift from actual codebase

## Find Candidate References

From Step 2 discovery, identify files that look like good pattern examples:

- Well-structured code files
- README or documentation describing patterns
- Example/reference directories (if any)
- Test files showing expected usage
- Core modules that others follow

## Propose to User

Present your findings:

```
REFERENCE CANDIDATES

I found these files that could serve as pattern references:

1. [file_path] - [why it looks like a good reference]
2. [file_path] - [why it looks like a good reference]
3. [file_path] - [why it looks like a good reference]

Which of these should I use as the primary reference for building the protocol?
Are there other files you'd recommend I study?
```

## User Confirmation Required

Wait for user to confirm or redirect. User knows:
- Which code is canonical vs legacy
- Which patterns are intentional vs accidental
- What the team considers "good" code

## Read Confirmed References

Once user confirms, read each reference file and note:
- Architecture patterns
- Naming conventions
- Code organization
- Error handling style
- Test patterns

## Output

List of confirmed reference files for Step 4.
