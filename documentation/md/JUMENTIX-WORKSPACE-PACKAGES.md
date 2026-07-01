# JumentiX Workspace Packages

This document tracks the current package map for monorepo migration waves.

## Runtime and Architecture Packages

- `@jumentix/message-mediator`
- `@jumentix/key-value-storage`
- `@jumentix/persistence-contracts`
- `@jumentix/mutex-service`
- `@jumentix/external-persistence-core`
- `@jumentix/external-store-proxy`
- `@jumentix/external-db-repositories`
- `@jumentix/database-client-factory`
- `@jumentix/runtime-infra`
- `@jumentix/adapter-runtime-bootstrap`

## Developer/Product Packages

- `@jumentix/cli-init`
- `@jumentix/sdk-rest-client`
- `@jumentix/sdk-websocket-client`
- `@jumentix/sdk-grpc-client`

## App Workspaces

- `@jumentix/backend-template` (placeholder during migration)
- `@jumentix/service-management` (placeholder during migration)

## Notes

- SDK packages now have package-level source and build scripts.
- Legacy `sdk-clients/` remains as backward-compatible bridge that re-exports from `packages/sdk-*`.
- Compatibility bridge contract is documented in `documentation/md/SDK-COMPATIBILITY-BRIDGE.md`.
- CLI package now owns canonical bootstrap implementation.
- Root CLI entrypoint remains as compatibility wrapper.
