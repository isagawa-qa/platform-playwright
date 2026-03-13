---
name: layer-validation
trigger: after-construction
action: validate-all-layers
---

# Layer Validation Checkpoints

## POM Checkpoint (UI / Hybrid)

- [ ] Locators are `static readonly` class constants
- [ ] Constructor takes `BrowserInterface` (composition, not inheritance)
- [ ] Atomic methods return `Promise<ClassName>` (return this)
- [ ] State-check methods return `Promise<boolean>` or `Promise<string>`
- [ ] No decorators on any methods
- [ ] No Task/Role imports
- [ ] No workflow logic

## Api Object Checkpoint (API / Hybrid)

- [ ] Endpoint paths are `static readonly` constants or static methods
- [ ] Constructor takes `ApiClient` (composition, not inheritance)
- [ ] Atomic methods return `Promise<ClassName>` (return this)
- [ ] State-check methods: `getLastStatus()`, `getLastBody<T>()`, `isLastStatusOk()`
- [ ] Typed request/response interfaces defined per resource
- [ ] `lastResponse: ApiResponseData` stores most recent response
- [ ] No decorators on any methods
- [ ] No hardcoded URLs (use static endpoint constants)
- [ ] No `fetch`/`axios` calls (use ApiClient exclusively)
- [ ] No Task/Role imports

## Task Checkpoint

- [ ] `@autologger('Task')` on all methods
- [ ] No decorator on constructor
- [ ] Constructor composes Page Objects (UI), Api Objects (API), or both (hybrid)
- [ ] All methods return `Promise<void>`
- [ ] No locator strings or endpoint URLs
- [ ] Uses POM/Api Object fluent API for chaining

## Role Checkpoint

- [ ] `@autologger('Role')` on workflow methods
- [ ] Constructor composes Task modules
- [ ] All methods return `Promise<void>`
- [ ] No locator strings or endpoint URLs
- [ ] No POM/Api Object imports (only Tasks)
- [ ] Workflow methods call MULTIPLE tasks

## Test Checkpoint

- [ ] Uses `test()` and `expect()` from fixtures
- [ ] Uses appropriate fixture(s): `browser_interface` (UI), `api_client` (API), or both (hybrid)
- [ ] AAA pattern: Arrange / Act / Assert
- [ ] Role workflow calls — no test-level orchestration (Act section)
- [ ] Asserts via POM state-check methods (UI) or Api Object state-check methods (API)
- [ ] No direct POM/Api Object action calls
- [ ] No Task calls (only Role calls)
