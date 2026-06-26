# 013 - Environment Loader CI Resilience

## Requirement
Test environment bootstrap must not fail if local-only env files are absent in CI.

## Why
CI runners should not depend on untracked local developer files.

## Acceptance criteria
- Environment loader uses fallback env files when primary file is missing.
- Missing env file does not crash unit test startup.
- CI-specific defaults are still applied when required.

## Status
Done
