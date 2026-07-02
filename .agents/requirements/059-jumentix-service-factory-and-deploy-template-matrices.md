# Requirement 059 - JumentiX Service Factory and Deploy Template Matrices

## Context

JumentiX productization requires explicit planning contracts for:

- service factory capability modes
- deploy target and packaging contracts
- bundler/runtime templates by artifact type

## Requirement

The project must maintain documented, indexed, and current matrix artifacts that define:

1. Service factory modes:
   - modular monolith backend
   - multi-service backend
   - hybrid backend + frontend
   - frontend-only SPA/PWA offline
2. Deploy target and packaging contracts:
   - VM/SSH, EC2/VM cloud, Lambda, Vercel Functions, Cloudflare Workers
   - required metadata contracts for Service Management
3. Bundler/runtime templates by artifact type:
   - backend service
   - frontend SPA
   - frontend SSR
   - backend npm library
   - frontend npm library

## Enforcement

- README documentation index must include links to all three matrix documents.
- `.agents/project-todos.md` must track these planning deliverables as complete/open with progress notes.
- Any change in runtime/deploy/factory model must update matrix docs and this requirement if contract scope changes.
