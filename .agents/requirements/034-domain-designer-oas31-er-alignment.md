# Requirement 034 - Domain Designer OpenAPI 3.1 ER Alignment

## Context
Domain Designer must model data entities and fields in a way that is compatible with OpenAPI 3.1 contracts used by the boilerplate.

## Rules
1. Domain Designer field definitions must remain OpenAPI-aware (types, formats, constraints).
2. Import/export paths must preserve supported field metadata used by OpenAPI 3.1 schemas.
3. Generated CRUD endpoint previews must stay consistent with exported OpenAPI naming/path conventions.
4. Model validation checks must include schema consistency safeguards that prevent obviously invalid exports.

## Implementation Notes
- Domain Designer is a modeling tool and contract assistant; it must reduce drift between model intent and API specification.
- Changes to supported field metadata must be reflected in:
  - `servicemangement/README.md`
  - project docs under `documentation/md/`
