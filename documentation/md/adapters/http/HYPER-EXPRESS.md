# Hyper-Express Adapter

## Purpose

Use Hyper-Express as high-performance REST adapter.

## Entrypoints

- `src/interface/HTTP/adapters/hyper-express/hyper-express.ts`
- `src/interface/HTTP/adapters/start-rest-api.ts`

## Build a Service with Hyper-Express

1. Keep module contracts/use cases unchanged.
2. Add Hyper-Express-specific handlers.
3. Run:

```bash
npm run dev:hyper-express
```

## Production

```bash
npm run prod:hyper-express
```

