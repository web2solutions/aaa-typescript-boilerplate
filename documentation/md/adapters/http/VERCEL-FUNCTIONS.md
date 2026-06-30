# Vercel Functions Adapter

## Purpose

Expose API operations through Vercel-style function handlers (`req`/`res`).

## Entrypoints

- `src/interface/HTTP/adapters/vercel-functions/vercel-functions.ts`

## Build a Service with Vercel Functions

1. Implement controller/use case logic in modules.
2. Implement framework-specific handler wrappers.
3. Run:

```bash
npm run dev:vercel-functions
```

