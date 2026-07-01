# Requirement 054 - SDK Compatibility Bridge Governance

## Context

During Wave 3 migration, SDK ownership moved to `packages/sdk-*`, but legacy imports under `sdk-clients/*` still exist.

## Requirement

1. `sdk-clients/*` must remain a pure compatibility layer (re-exports only).
2. New SDK implementation code must live only under `packages/sdk-*`.
3. Bridge behavior and removal criteria must be explicitly documented.
4. README index must link the bridge documentation.

## Acceptance criteria

- `sdk-clients/*` files contain only package re-exports and bridge aggregator.
- `documentation/md/SDK-COMPATIBILITY-BRIDGE.md` exists.
- Root README links to bridge documentation.
