# 041 - PM2 VM Runtime Orchestration

## Context

VM-hosted environments (`dev`, `staging`, `production`) must use PM2 as the official process manager for runtime services and tooling.

## Requirements

1. Runtime service profiles supported by Service Configuration:
   - `RESTAPI`
   - `websocketAPI + RESTAPI`
   - `grpcAPI + RESTAPI`
2. In VM environments, `RESTAPI`, `websocketAPI`, and `grpcAPI` must run as separated PM2 processes (no shared in-process bootstrap coupling).
3. `servicemangement` must be served by PM2.
4. Dev startup must automatically include the `servicemangement` PM2 process.
5. PM2 ecosystem files must exist for:
   - `dev`
   - `staging`
   - `production`
6. Package scripts that boot runtime adapters from:
   - `src/interface/HTTP/adapters`
   - `src/interface/gRPC/adapters`
   - `src/interface/WebSocket/adapters`
   must use PM2-based startup flow.

## Validation

- PM2 profile commands start the expected process sets and separated ports.
- Runtime docs and Service Management docs reflect PM2 orchestration.
- `ci:gate` and patch coverage requirements remain green after changes.

