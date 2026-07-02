# Requirement 047 - Realtime API Test Matrix

## Requirement

Realtime APIs must have explicit automated validation at three levels:

1. **Unit tests** for WebSocket and gRPC adapters/core runtime behavior.
2. **Integration tests** for protocol-level request/response execution.
3. **Smoke tests** for quick runtime health, including multi-instance Redis-backed validation where applicable.

## Acceptance Criteria

- Unit coverage exists for:
  - `WebSocketAPI`
  - `gRPCAPI`
  - realtime bootstrap loaders
  - adapter strategy modules (`cluster`, `redis-streams`)
- Integration coverage exists for:
  - basic WebSocket realtime flow
  - basic gRPC realtime flow
  - multi-instance Socket.IO + Redis Streams propagation
- Smoke coverage exists for:
  - local realtime protocol boot/response
  - Redis-backed multi-instance command path
- Scripts are available in `package.json` for all realtime test scopes.
- Documentation is updated:
  - `documentation/md/REALTIME-API-TESTING.md`
  - README index links

## Notes

- Redis-backed integration should be environment-gated for CI/local portability (`RUN_REDIS_INTEGRATION=1`).
- Realtime smoke/integration commands should run with `--coverage=false` to avoid coverage artifact drift.

