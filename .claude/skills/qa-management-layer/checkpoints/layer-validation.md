# Layer Validation Checkpoints

## POM Checkpoint

- [ ] Locators are `static readonly` class constants
- [ ] Constructor takes `BrowserInterface` (composition, not inheritance)
- [ ] Atomic methods return `Promise<ClassName>` (return this)
- [ ] State-check methods return `Promise<boolean>` or `Promise<string>`
- [ ] No decorators on any methods
- [ ] No Task/Role imports
- [ ] No workflow logic

## Task Checkpoint

- [ ] `@autologger('Task')` on all methods
- [ ] No decorator on constructor
- [ ] Constructor composes Page Objects
- [ ] All methods return `Promise<void>`
- [ ] No locator strings (selectors)
- [ ] Uses POM fluent API for chaining

## Role Checkpoint

- [ ] `@autologger('Role')` on workflow methods
- [ ] Constructor composes Task modules
- [ ] All methods return `Promise<void>`
- [ ] No locator strings (selectors)
- [ ] No POM imports (only Tasks)
- [ ] Workflow methods call MULTIPLE tasks

## Test Checkpoint

- [ ] Uses `test()` and `expect()` from fixtures
- [ ] Uses `browser_interface` fixture
- [ ] AAA pattern: Arrange / Act / Assert
- [ ] Role workflow calls — no test-level orchestration (Act section)
- [ ] Asserts via POM state-check methods
- [ ] No direct POM action calls
- [ ] No Task calls (only Role calls)
