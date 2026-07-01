# 051 - Runtime Bootstrap Shared Packages

## Context

As part of JumentiX monorepo productization, adapter bootstrapping must avoid repeated wiring logic across HTTP, WebSocket, and gRPC startup files.

## Requirement

1. Runtime bootstrap concerns must be centralized into reusable workspace packages:
   - infra selection by env (`database`, `key-value`, `mutex`)
   - adapter composition (`jwt`, `crypto`, `message mediator`, `auth service`)
2. Interface adapters must consume shared bootstrap compilers rather than duplicating wiring logic.
3. Existing adapter entrypoints must remain backward compatible while migration happens.

## Acceptance Criteria

- Shared packages are created and used by adapter entrypoints.
- Core adapter bootstrap tests remain green.
- No change in runtime contract for existing startup commands.
