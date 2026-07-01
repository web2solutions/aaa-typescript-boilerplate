# Realtime API Testing Guide

This document defines the official test matrix for realtime interfaces (`WebSocketAPI` and `gRPCAPI`).

## Scope

Covered interfaces:

- `src/interface/WebSocket/WebSocketAPI.ts`
- `src/interface/gRPC/gRPCAPI.ts`
- Socket.IO horizontal adapters:
  - `cluster`
  - `redis-streams`

## Test Matrix

## 1) Unit Tests

WebSocket:

- `test/unit/interface/WebSocket/WebSocketAPI.test.ts`
- `test/unit/interface/WebSocket/adapters/start-websocket-api.test.ts`
- `test/unit/interface/WebSocket/adapters/socket-io.bootstrap.test.ts`
- `test/unit/interface/WebSocket/clusterAdapter.test.ts`
- `test/unit/interface/WebSocket/redisStreamsAdapter.test.ts`

gRPC:

- `test/unit/interface/gRPC/gRPCAPI.test.ts`
- `test/unit/interface/gRPC/adapters/start-grpc-api.test.ts`
- `test/unit/interface/gRPC/adapters/grpc.bootstrap.test.ts`

Shared realtime core:

- `test/unit/interface/Async/RealtimeAPIBase.test.ts`

Run:

```bash
npm run test:unit
```

## 2) Integration Tests

Protocol-level integration:

- `test/integration/realtime/websocket.basic.integration.test.ts`
- `test/integration/realtime/grpc.basic.integration.test.ts`

Redis multi-instance integration:

- `test/integration/realtime/socketio.redis-streams.multi-instance.test.ts`

Run basic realtime integrations:

```bash
npm run test:integration:realtime
```

Run Redis multi-instance integration (requires Redis):

```bash
npm run test:integration:realtime:redis-streams
```

## 3) Smoke Tests

Local realtime smoke:

- `test/smoke/realtime/RealtimeApis.smoke.test.ts`

Run:

```bash
npm run test:smoke:realtime
```

End-to-end Redis smoke (Docker + multi-instance + cleanup):

```bash
npm run smoke:realtime:redis-streams
```

## CI Behavior

- Realtime basic integration and smoke tests are runnable without external Redis.
- Redis-backed multi-instance test is gated by `RUN_REDIS_INTEGRATION=1`.
- Jest ignore policy excludes only `socketio.redis-streams.multi-instance.test.ts` when Redis integration is disabled.

## Operational Notes

1. Keep realtime tests `--coverage=false` for smoke/integration scripts.
2. Maintain deterministic fixed ports for isolated test files.
3. Always close socket clients and stop server instances in `afterAll`.
4. Update this file and `.agents` requirements whenever realtime transport behavior changes.

