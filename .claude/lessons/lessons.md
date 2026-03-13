# Lessons Learned — Index

<!-- INDEX file — points to payloads. Do not duplicate payload content here. -->
<!-- 200-line threshold: split when exceeded. -->
<!-- Tiered indexing: payload files hold details, this file is the index. -->

## How This Works

The agent reads this index during every `/kernel/anchor`. Each topic folder contains
expert domain knowledge seeded before the first cycling run, plus lessons accumulated
from failures during autonomous execution.

- **Index** = points to files. Contains no substantive content.
- **Payload** = contains the knowledge. Pointed to by an index.
- **200-line rule** = any payload exceeding 200 lines splits into a sub-index + sub-payloads.

**Seeded knowledge** = best practices encoded upfront so the agent avoids common mistakes.
**Learned knowledge** = lessons recorded by `/kernel/learn` after real failures.

## Topic Folders

| Topic | Path | Contents |
|-------|------|----------|
| Framework Architecture | `framework/architecture.md` | 5-layer rules, BrowserInterface-first, ApiClient-first, extend BI/ApiClient |
| Locators & Selectors | `locators/selectors.md` | Role-based selector strings, priority order, anti-patterns |
| Assertions & Waits | `assertions/waits.md` | Web-first assertions, auto-waiting, explicit waits |
| Test Organization | `test-org/organization.md` | Fixtures, hooks, parallelism, data management |
| Error Handling & CI | `error-handling/ci.md` | Retries, tracing, screenshots, reporters, timeouts |
| Advanced Interactions | `advanced/` | **INDEX** → file ops, UI controls, network & config |
| — File Operations | `advanced/file-operations.md` | Uploads, downloads (BI methods) |
| — UI Controls | `advanced/ui-controls.md` | Dialogs, iframes, keyboard, hover, select |
| — Network & Config | `advanced/network-and-config.md` | Network interception, auth state, tabs, mobile |
| API Testing | `api/` | **INDEX** → patterns, assertions, hybrid |
| — API Patterns | `api/patterns.md` | Request patterns, auth strategies, Api Object conventions, anti-patterns |
| — API Assertions | `api/assertions.md` | Status codes, body validation, headers, timing, negative testing |
| — Hybrid Testing | `api/hybrid.md` | API seed + UI verify, shared auth, cleanup, hybrid task patterns |
| MCP Integration | `mcp/integration.md` | browser_snapshot for discovery, selector translation |
