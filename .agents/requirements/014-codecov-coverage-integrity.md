# 014 - Codecov Coverage Integrity

## Requirement
Coverage uploaded to Codecov must reflect intended test scope and not be overwritten by smoke-only runs.
Global minimum coverage target is 95% for statements, branches, lines, and functions.

## Why
A late smoke test with coverage enabled can overwrite richer unit coverage artifacts and fail thresholds.

## Acceptance criteria
- Smoke test command does not generate/override coverage artifacts.
- CI uploads coverage from the main intended coverage-producing stage.
- Codecov project status target is set to `95%`.
- Codecov patch status target is set to `95%`.
- Jest global `coverageThreshold` is set to `95%` for all metrics.

## Status
Active (enforced, currently below target)
