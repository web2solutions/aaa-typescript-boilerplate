# 014 - Codecov Coverage Integrity

## Requirement
Coverage uploaded to Codecov must reflect intended test scope and not be overwritten by smoke-only runs.

## Why
A late smoke test with coverage enabled can overwrite richer unit coverage artifacts and fail thresholds.

## Acceptance criteria
- Smoke test command does not generate/override coverage artifacts.
- CI uploads coverage from the main intended coverage-producing stage.

## Status
Done
