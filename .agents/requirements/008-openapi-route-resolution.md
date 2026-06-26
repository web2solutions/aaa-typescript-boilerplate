# 008 - OpenAPI Route Resolution

## Requirement
Every OpenAPI operation must resolve to a valid handler/controller method before runtime tests.

## Why
Spec drift and dynamic route loading can fail late without explicit resolution checks.

## Acceptance criteria
- Route resolution validation script exists and runs in CI.
- CI fails when operation to handler/controller mapping is broken.

## Status
Done
