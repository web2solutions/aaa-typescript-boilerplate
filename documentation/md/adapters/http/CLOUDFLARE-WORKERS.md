# Cloudflare Workers Adapter

## Purpose

Run HTTP APIs in Cloudflare Workers style (`fetch` contract), without Express runtime.

## Entrypoints

- `src/interface/HTTP/adapters/cloudflare-workers/cloudflare-workers.ts`

## Build a Service with Cloudflare Workers

1. Implement operation handlers for this framework.
2. Keep domain and use case layers shared with other adapters.
3. Use worker fetch dispatcher.
4. Run:

```bash
npm run dev:cloudflare-workers
```

