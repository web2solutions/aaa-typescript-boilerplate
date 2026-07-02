# JumentiX Bundler and Runtime Templates

## Objective

Define baseline templates by artifact type so the bootstrap CLI and workspace packages produce predictable build/runtime behavior.

## Template Matrix

| Artifact Type | Build Tooling Baseline | Runtime Baseline | Output Contract |
|---|---|---|---|
| Backend Service (Node) | TypeScript compiler (`tsc`) with workspace paths | Node 22 + PM2 profile + env-based adapter loader | JS build output + source maps + env contract |
| Frontend SPA | Modern bundler profile (Vite-equivalent) + TS | Browser runtime with static hosting | Static assets bundle + optional PWA manifest |
| Frontend SSR | SSR-capable bundler profile + TS | Node runtime (server entry) + static assets | server bundle + client bundle + env contract |
| Backend npm Library | `tsc` + declaration output | Consumer-managed Node runtime | package `main` + `types` + `files` whitelist |
| Frontend npm Library | bundler library mode + TS declarations | Browser/SSR consumer runtime | ESM/CJS bundle + types + style/assets contract |

## Runtime Template Rules

- Node runtime is fixed to major version `22`.
- Backend startup is selected by environment contracts:
  - `AAA_HTTP_FRAMEWORK`
  - `AAA_REALTIME_API`
  - `AAA_REALTIME_API_PROTOCOL`
  - `AAA_DATABASE_DRIVER`
  - `AAA_KEYVALUESTORAGE_DRIVER`
- REST fallback remains active for realtime service profiles.

## Build/Release Rules

- All workspace packages must expose `build`, `test`, and `typecheck` scripts.
- Publishable packages must have valid semver versions and non-empty `files` metadata.
- Root release automation must keep:
  - `changelog:update`
  - `changelog:check`
  - `release:dry-run`
  - `release:dry-run:packages`
  - `release:dry-run:apps`
- CI gate includes release governance validation through `npm run release:governance:check`.

## CLI Scaffold Mapping

Bootstrap service types should map to templates:

| CLI Service Type | Template |
|---|---|
| `restapi` | Backend Service (Node) |
| `websocket+restapi` | Backend Service (Node) + Realtime profile |
| `grpc+restapi` | Backend Service (Node) + Realtime profile |
| `functions` | Provider function bundle template |
| `frontend-spa` | Frontend SPA |
| `frontend-ssr` | Frontend SSR |
| `lib-backend` | Backend npm Library |
| `lib-frontend` | Frontend npm Library |

## Acceptance Criteria

- Template definitions are documented and linked from README index.
- CI and release checks enforce required metadata and script contracts.
- Scaffold logic can map each service type to one explicit template.
