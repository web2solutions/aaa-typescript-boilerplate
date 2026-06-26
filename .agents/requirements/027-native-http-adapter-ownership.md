# 027 - Native HTTP Adapter Ownership

## Requirement
Every HTTP framework/runtime integration must use its own runtime/server adapter semantics and must not rely on `ExpressServer` inheritance as the transport runtime.

## Scope
- Cloudflare Workers
- Vercel Functions
- LoopBack
- Sails.js
- Feathers
- Derby.js
- Adonis.js
- Total.js

## Rules
- Cloudflare Workers must follow serverless `fetch` style, similar to lambda operation dispatching.
- Vercel Functions must run as function wrappers (`req/res`) and not as an Express server process.
- Framework adapters must bootstrap their own runtime behavior.
- Endpoint contract parity must be preserved through operation handler fallback only when framework-specific handlers are intentionally absent.

## Definition of done
- No new adapter above extends `ExpressServer`.
- Runtime entrypoints and docs reflect each adapter behavior.
- Lint/build/unit tests remain green after adapter updates.
