# Jumentix Wave 5 Governance Evidence (2026-07-02)

This snapshot records governance evidence for monorepo Wave 5 closeout tasks tracked in GitHub Project **Jumentix**.

## Tracked Issues

- #113 — Normalize remaining legacy paths after app re-homing
- #114 — Stabilize CI gate and test entrypoints after migration
- #115 — Fix Serverless/Lambda handler path mapping to `restapi`
- #116 — Close Wave 5 governance status and evidence mapping

## Execution Evidence

### CI and test gate stabilization (#114)

Validated locally:

```bash
npm run ci:gate
```

Result: **pass** (lint + architecture checks + unit + OAS route resolution + build + smoke).

### Serverless handler mapping validation (#115)

Added explicit validation command:

```bash
npm run serverless:check-handlers
```

Result: **pass** (`34` handlers resolved to existing files).

`ci:gate` now runs `serverless:check-handlers` before build.

### Path normalization updates (#113)

Updated key runtime docs/examples to post-migration app-owned paths:

- `README.md`
- `documentation/md/CI-TROUBLESHOOTING.md`
- `documentation/md/SETUP-RUNTIME-AND-API.md`
- `documentation/md/DATABASE-DRIVERS-SMOKE-TESTS.md`
- `documentation/md/RUNTIME-ENVIRONMENT-CONTRACTS.md`
- `documentation/md/EVENTS-AND-MESSAGES-MAP.md`
- `documentation/md/HEXAGONAL-FEATURE-DRIVEN-MIGRATION.md`

## GitHub Project Status Snapshot

- #114: **Done**
- #115: **Done**
- #113: **In progress**
- #116: **In progress**

## Constraints / Follow-up

- `.agents/*` is read-only in the current execution environment, so agent-file alignment for this wave must be completed in a writable follow-up pass.
