# Total.js Adapter

## Purpose

Use Total.js runtime bridge as HTTP inbound adapter.

## Entrypoints

- `src/interface/HTTP/adapters/total-js/total-js.ts`

## Build a Service with Total.js

1. Implement module operations in controllers/use cases.
2. Bind Total.js routes/handlers to those operations.
3. Run:

```bash
npm run dev:total-js
```

