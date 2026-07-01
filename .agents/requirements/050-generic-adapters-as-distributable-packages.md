# Requirement 050 - Generic Adapters as Distributable npm Packages

## Requirement

Any adapter that is generic and reusable across multiple services must be extracted as a distributable npm package.

The adapter must not remain duplicated inside each generated service codebase when it can be consumed as a shared package.

## Acceptance Criteria

- Reusable adapters are implemented under workspace packages and prepared for npm distribution.
- Service code imports reusable adapters/contracts from workspace packages instead of local duplicated implementations.
- Local legacy files (when kept temporarily) must be thin re-exports only, to avoid behavior drift.
- Package-level documentation exists describing:
  - purpose
  - supported runtimes/providers
  - integration usage
- Migration wave todos and requirements registry are updated when a new reusable adapter is packaged.

## Notes

- `@jumentix/message-mediator` is the reference implementation pattern.
