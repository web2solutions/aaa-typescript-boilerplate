# Restify Adapter

## Purpose

Use Restify as REST adapter where Restify middleware/runtime behavior is required.

## Entrypoints

- `src/interface/HTTP/adapters/restify/restify.ts`
- `src/interface/HTTP/adapters/start-rest-api.ts`

## Build a Service with Restify

1. Implement operation controllers and use cases.
2. Implement Restify handler mapping in module interface framework folder.
3. Run:

```bash
npm run dev:restify
```

## Production

```bash
npm run prod:restify
```

