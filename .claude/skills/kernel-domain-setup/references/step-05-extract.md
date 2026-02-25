# Step 5: Extract Patterns

From the reference code, identify:

## Architecture

- What layers exist?
- How do layers compose each other?
- What is the call hierarchy?

## Patterns (what code DOES)

- Decorator usage per layer (`@autologger('Task')`, `@autologger('Role')`)
- Return value conventions per layer (`this` for POMs, `void` for Tasks/Roles)
- Naming conventions (PascalCase classes, camelCase methods, kebab-case files)
- Locator placement (static readonly in POMs only)
- Assertion patterns (POM state-check methods in tests)

## Anti-Patterns (what code does NOT do)

- Where locators should NOT appear (Tasks, Roles, Tests)
- What should NOT return values (Tasks, Roles)
- What should NOT be composed (Roles importing POMs directly)

## Data Patterns

- How are fixtures structured? (`tests/fixtures/index.ts`)
- How is test data organized? (`tests/data/`)
- How is the browser provided? (BrowserInterface via fixtures)

## Action

Document findings. These will be indexed (not copied) into the protocol.
