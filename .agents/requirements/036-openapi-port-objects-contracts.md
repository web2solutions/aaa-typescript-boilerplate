# Requirement 036 - OpenAPI Port Objects Contracts

## Context
The OpenAPI specification must consistently describe input and output port objects for endpoint contracts.

## Rules
1. Every operation with `requestBody` must reference a schema object in `components.schemas` via `$ref`.
2. Every successful (`2xx`) operation response must expose a content schema referenced by `$ref`.
3. Referenced request/response schemas must include a non-empty `description`.
4. Contract drift must be blocked in CI by automated validation.

## Implementation Notes
- Validation is enforced by `ci-cd/check-oas-route-resolution.js`.
- This requirement applies to `spec/1.0.0.yml` and future versioned specs.
