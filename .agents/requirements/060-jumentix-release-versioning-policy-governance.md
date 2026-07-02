# Requirement 060 - JumentiX Release and Versioning Policy Governance

## Context

JumentiX monorepo needs a deterministic release/version policy to avoid drift across apps/packages and keep CI release checks reliable.

## Requirement

- The canonical policy file `release-policy.json` must exist at repository root.
- Policy model:
  - `packages/*` follow independent versioning.
  - `apps/*` follow locked versioning tied to root `package.json` version.
- Release governance checks must fail CI when policy or metadata contracts are violated.

## Enforcement

- `npm run release:governance:check` is mandatory and included in `npm run ci:gate`.
- App workspaces must be `private: true` and their `version` must match `release-policy.json.appLockedVersion`.
- Publishable packages must have valid semver and non-empty `files` metadata.
- Root release scripts (`changelog:*`, `release:dry-run*`) must remain present.

## Documentation Sync

- Keep `documentation/md/JUMENTIX-RELEASE-AND-VERSIONING-STRATEGY.md` updated.
- Keep README Documentation Index linked to the release strategy document.
