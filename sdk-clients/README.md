# sdk-clients (Compatibility Layer)

Legacy compatibility surface for SDK imports.

## Purpose

This directory is maintained to avoid breaking existing imports while the monorepo migration moves SDK ownership to workspace packages:

- `@jumentix/sdk-rest-client`
- `@jumentix/sdk-websocket-client`
- `@jumentix/sdk-grpc-client`

## Current behavior

- `sdk-clients/rest/RestApiClient.ts` re-exports from `packages/sdk-rest-client`.
- `sdk-clients/websocket/WebSocketApiClient.ts` re-exports from `packages/sdk-websocket-client`.
- `sdk-clients/grpc/GrpcApiClient.ts` re-exports from `packages/sdk-grpc-client`.
- `sdk-clients/spec/loadSpecs.ts` aggregates per-package spec loaders.

## Migration guidance

Use workspace packages directly for new code. Keep this compatibility layer only for backward compatibility until full cutover.
