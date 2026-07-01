# Runtime Environment Contracts

This document defines the runtime environment contract used to bootstrap API adapters and PM2 process profiles.

## Purpose

Guarantee deterministic startup behavior for:

- REST API adapters
- Realtime API adapters (WebSocket, gRPC)
- Service Management runtime profile editor

All runtime startup entrypoints must follow this contract.

## Runtime Keys

The following keys are mandatory across env files in `src/config/`:

- `AAA_HTTP_FRAMEWORK`
  - default: `express`
  - current supported values: `express`
  - used by: `src/interface/HTTP/adapters/start-rest-api.ts`

- `AAA_REALTIME_API`
  - default: `no`
  - supported values: `yes`, `no`
  - used by:
    - `src/interface/WebSocket/adapters/start-websocket-api.ts`
    - `src/interface/gRPC/adapters/start-grpc-api.ts`

- `AAA_REALTIME_API_PROTOCOL`
  - default: `websocket`
  - supported values: `websocket`, `grpc`
  - used by:
    - `src/interface/WebSocket/adapters/start-websocket-api.ts`
    - `src/interface/gRPC/adapters/start-grpc-api.ts`

- `AAA_REALTIME_API_DATABASE_DRIVER`
  - default: `Mongo`
  - supported values:
    - `Mongo`
    - `PostgreSQL`
    - `MySQL`
    - `MS SQL`
    - `RDS`
    - `Aurora`
    - `Cassandra`
  - used by: runtime profile metadata and Service Management configuration workflows.

- `AAA_WEBSOCKET_SOCKETIO_ADAPTER`
  - default: empty (in-memory Socket.IO adapter)
  - supported values: `cluster`, `redis-streams`
  - used by: `src/interface/WebSocket/adapters/socket-io/socket-io.ts`

- `AAA_WEBSOCKET_CLUSTER_WORKERS`
  - optional worker count for Socket.IO cluster mode.
  - default: CPU core count.
  - used by: `src/interface/WebSocket/adapters/start-websocket-api.ts`

- `AAA_WEBSOCKET_REDIS_URL`
  - optional dedicated Redis connection URL for Socket.IO scaling adapter.
  - example: `redis://127.0.0.1:6379/1`
  - used by: `src/interface/WebSocket/adapters/socket-io/redisStreamsAdapter.ts`

- `AAA_REDIS_URL`
  - optional global Redis URL fallback used by WebSocket scaling adapter when
    `AAA_WEBSOCKET_REDIS_URL` is not set.
  - used by: `src/interface/WebSocket/adapters/socket-io/redisStreamsAdapter.ts`

## Startup Entrypoints

- REST:
  - `src/interface/HTTP/adapters/start-rest-api.ts`
- WebSocket:
  - `src/interface/WebSocket/adapters/start-websocket-api.ts`
- gRPC:
  - `src/interface/gRPC/adapters/start-grpc-api.ts`

These files are the official process entrypoints used by PM2 ecosystem profiles.

## PM2 Process Model

For VM environments, each interface runs in its own PM2 process:

- `REST API` process
- `WebSocket API` process
- `gRPC API` process
- `Service Management` process

Runtime profiles:

- `REST API`
- `WebSocket API + REST API`
- `gRPC API + REST API`

## Service Management Runtime Env API

Service Management exposes runtime env read/write endpoints:

- `GET /api/runtime/env?environment=dev|staging|ci`
- `POST /api/runtime/env`

The env editor mutates only approved keys from this contract, preserving guardrails.

## Guardrails

- Unsupported `AAA_HTTP_FRAMEWORK` must fail fast.
- Realtime boot must not start when:
  - `AAA_REALTIME_API` is not `yes`, or
  - `AAA_REALTIME_API_PROTOCOL` does not match the adapter entrypoint.
- Runtime env persistence must be explicit and environment-targeted (`dev`, `staging`, `ci`).

## Operational Examples

REST only:

```bash
AAA_HTTP_FRAMEWORK=express
AAA_REALTIME_API=no
```

WebSocket + REST:

```bash
AAA_HTTP_FRAMEWORK=express
AAA_REALTIME_API=yes
AAA_REALTIME_API_PROTOCOL=websocket
AAA_WEBSOCKET_SOCKETIO_ADAPTER=cluster
AAA_WEBSOCKET_CLUSTER_WORKERS=4
```

WebSocket + REST (multi-host via Redis Streams):

```bash
AAA_HTTP_FRAMEWORK=express
AAA_REALTIME_API=yes
AAA_REALTIME_API_PROTOCOL=websocket
AAA_WEBSOCKET_SOCKETIO_ADAPTER=redis-streams
AAA_WEBSOCKET_REDIS_URL=redis://127.0.0.1:6379/1
```

gRPC + REST:

```bash
AAA_HTTP_FRAMEWORK=express
AAA_REALTIME_API=yes
AAA_REALTIME_API_PROTOCOL=grpc
```
