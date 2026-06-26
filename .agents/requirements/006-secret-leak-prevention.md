# 006 - Secret Leak Prevention

## Requirement
No API response may expose user `password` or `salt`.

## Why
Secret leakage is a critical security vulnerability.

## Acceptance criteria
- Outgoing user DTOs are centrally sanitized.
- All read/update paths prevent password/salt exposure.
- Auth-only paths that need password access are internal-only.

## Status
Done
