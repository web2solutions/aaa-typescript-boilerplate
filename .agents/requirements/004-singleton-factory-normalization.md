# 004 - Singleton Factory Normalization

## Requirement
Factory `compile()` calls must not leak stale singleton instances across runs/tests.

## Why
Shared singleton state makes tests flaky and service composition brittle.

## Acceptance criteria
- Factory calls return fresh instances for isolated tests/composition.
- No stale cross-test dependency retention.

## Status
Done
