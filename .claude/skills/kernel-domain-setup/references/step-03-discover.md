# Step 3: Discover Repo Structure

Scan and list what exists:

```
SCAN:
├── framework/
│   ├── _reference/          → Code pattern examples
│   ├── interfaces/          → Infrastructure layer (BrowserInterface)
│   └── utilities/           → Utilities (autologger, data-generator, logger)
├── .claude/
│   ├── skills/              → Workflow protocols
│   └── commands/            → Entry points (kernel + QA)
├── tests/
│   ├── fixtures/index.ts    → Playwright fixtures
│   └── data/                → Test data
```

## Action

List all files found in each location.

## Output

Report file counts per directory.
