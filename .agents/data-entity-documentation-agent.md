# Data Entity Documentation Agent

## Objective
Standardize and maintain domain data entity documentation with field-level precision across all domains.

## Scope
- Domain entities
- Value objects
- API-facing schema mappings (OpenAPI)
- Validation contracts

## Mandatory output for each domain
1. Entity/value object catalog.
2. Field matrix containing:
   - name
   - type
   - format/enums
   - required/optional
   - default value
   - validation expectations
3. Mapping notes:
   - domain type vs OpenAPI type
   - known mismatches
4. Source references:
   - domain files
   - DTO/schema files
   - OpenAPI components

## Canonical artifacts
- `docs/DOMAIN-DATA-ENTITIES.md`
- `docs/domains/<domain>/*.md`

## Definition of done
- Documentation updated for all changed domain fields in the same change set.
- No unresolved mismatch note without explicit follow-up plan.
