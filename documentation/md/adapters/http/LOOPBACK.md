# LoopBack Adapter

## Purpose

Run API operations with LoopBack runtime integration.

## Entrypoints

- `src/interface/HTTP/adapters/loopback/loopback.ts`

## Build a Service with LoopBack

1. Keep business/use-case contracts in module layer.
2. Use LoopBack adapter bootstrap to expose routes/handlers.
3. Run:

```bash
npm run dev:loopback
```

