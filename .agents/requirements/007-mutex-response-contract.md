# 007 - Mutex Response Contract

## Requirement
Mutex lock responses must use one consistent shape across all callers.

## Why
Different response keys (`previouslyLocked` vs `wasAlreadyLocked`) create subtle runtime bugs.

## Acceptance criteria
- `MutexService.lock()` always returns the same lock state key.
- Callers consume the standardized key only.

## Status
Done
