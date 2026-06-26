# 003 - Service Dependency Wiring

## Requirement
Base service wiring must inject `services` from `config.services`, not `config.repos`.

## Why
Incorrect wiring hides dependency injection mistakes and causes runtime surprises.

## Acceptance criteria
- Service dependencies resolve from the correct config key.
- Unit coverage protects wiring behavior.

## Status
Done
