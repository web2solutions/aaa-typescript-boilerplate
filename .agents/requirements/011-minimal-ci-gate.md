# 011 - Minimal CI Gate

## Requirement
CI must enforce a minimal quality gate before merge.

## Why
A consistent gate avoids regressions while keeping pipeline time reasonable.

## Gate scope
- Lint
- Unit tests
- OpenAPI route resolution check
- Build (`build:dev`)
- Integration smoke check

## Status
Done
