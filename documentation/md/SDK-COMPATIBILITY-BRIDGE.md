# SDK Compatibility Bridge

This project currently exposes two SDK access paths during monorepo migration:

1. New canonical workspace packages:
   - `@jumentix/sdk-rest-client`
   - `@jumentix/sdk-websocket-client`
   - `@jumentix/sdk-grpc-client`
2. Legacy compatibility path:
   - `sdk-clients/*`

## Why this bridge exists

- Avoid breaking existing imports while migration is in progress.
- Keep Wave 3 (SDK package split) incremental and low-risk.
- Enable parallel adoption without a forced big-bang refactor.

## Bridge contract

- Legacy files under `sdk-clients/` must only re-export package implementations.
- New SDK features should be implemented only in `packages/sdk-*`.
- Documentation and examples should prioritize `@jumentix/sdk-*` imports.

## Decommission criteria

The compatibility bridge can be removed when:

1. all internal imports are migrated to `@jumentix/sdk-*`,
2. external consumers confirm no dependency on `sdk-clients/*`,
3. migration wave acceptance checklist marks SDK split as complete.
