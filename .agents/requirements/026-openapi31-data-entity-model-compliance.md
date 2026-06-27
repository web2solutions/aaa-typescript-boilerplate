# Requirement 026 - OpenAPI 3.1 Data Entity and Model Compliance

## Context
Data entities and domain model field schemas must stay aligned with OpenAPI 3.1 to avoid contract drift between domain metadata, API schema, and runtime validation.

## Mandatory rules
1. Data entity fields must use allowed OpenAPI 3.1 data types supported by this project.
2. Field format must be compatible with the selected type.
3. Validation keywords must be compatible with the selected type.
4. CLI entity/model management must enforce these constraints before saving changes.
5. Base model utilities must expose reusable OpenAPI 3.1 schema guards for implemented domains.
6. Implemented domain models must keep explicit schema metadata compliant with these rules.

## Verification
- Unit tests must cover valid and invalid field/entity schema paths.
- CLI tests must cover interactive schema selection and validation scenarios.
- CI coverage threshold policy remains mandatory (`>= 95%` global statements/lines and configured branch threshold).
