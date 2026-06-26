# 002 - Build Compatibility

## Requirement
`npm run build:dev` must stay green with current dependency set.

## Why
Build breakage blocks releases and hides real regressions.

## Acceptance criteria
- TypeScript compile passes in CI.
- Dependency updates do not break compile scripts.

## Status
Done
