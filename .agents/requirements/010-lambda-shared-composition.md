# 010 - Lambda Shared Composition

## Requirement
Lambda handlers should reuse the same service/controller composition strategy used by REST adapters.

## Why
Duplicated wiring between Lambda and REST drifts over time and increases maintenance risk.

## Acceptance criteria
- Shared composition factory is used by Lambda and REST entrypoints.
- Wiring changes in core composition propagate consistently.

## Status
Done
