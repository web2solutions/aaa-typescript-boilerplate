# Developer Automation CLI

This project includes a developer-facing CLI wrapper to accelerate domain and data model setup workflows.

It is designed to reduce manual scaffolding and keep domain definitions closer to implementation intent during early feature discovery.

## Purpose

The CLI provides an interactive menu with sub applications to:

1. Manage Domains (CRUD)
2. Manage Data Entities and Models (CRUD + field management)

This supports faster iteration when creating new bounded contexts, aggregates, entities, and field contracts.

## Commands

Use any of the following commands:

```bash
npm run cli
npm run dev:cli
npm run start:cli
```

All commands start the same CLI entrypoint:

- `src/interface/CLI/index.ts`

Bootstrap/scaffold command:

```bash
npm run cli:bootstrap
```

The bootstrap flow is also exposed as installable bin command:

```bash
aaa-bootstrap
```

## Current Sub Applications

### 1) Domains CRUD

Operations:

- List domains
- Search domains
- Create domain
- Update domain
- Delete domain

Domain definition includes:

- `id`
- `name`
- `description`
- `boundedContext`
- `status` (`draft | active | deprecated`)
- `tags`
- `createdAt`
- `updatedAt`

### 2) Data Entities and Models CRUD

Operations:

- List entities/models
- Search entities/models
- Create entity/model
- Update entity/model
- Delete entity/model
- Manage fields

Field manager capabilities:

- List fields for the selected entity/model
- View detailed field information (name, type, required, format, default, validations, behavior)
- Add new fields
- Update full field definition
- Edit only field behavior/notes for a selected field
- Delete fields

OpenAPI 3.1 compliance behavior:

- Field `type` selection is restricted to OpenAPI 3.1 primitive/data schema types supported by the project:
  - `string`
  - `number`
  - `integer`
  - `boolean`
  - `array`
  - `object`
- Field `format` options are presented according to the selected type.
- Validation keywords are presented according to the selected type.
- New and updated entity field sets are validated before persistence.
- Invalid schema combinations are rejected by the CLI flow.

Entity/model definition includes:

- `id`
- `name`
- `domain`
- `kind` (`entity | valueObject | aggregate | model`)
- `description`
- `fields`
- `behaviors`
- `createdAt`
- `updatedAt`

Field definition includes:

- `name`
- `type`
- `required`
- `format`
- `defaultValue`
- `validations`
- `behavior`

## OpenAPI 3.1 Schema Rules in Code

Central validation helpers and registries:

- `src/shared/openapi/OpenApi31DataEntity.ts`

Domain model enforcement:

- `src/modules/port/BaseModel.ts`
  - `throwIfFieldSchemaIsNotOpenApi31Compliant(...)`
  - `throwIfDataEntitySchemaIsNotOpenApi31Compliant(...)`

Implemented domain schema example:

- `src/modules/Users/domain/Model/User.ts`
  - static `dataEntitySchema`

## Persistence

CLI data is persisted in:

- `.aaa-cli/workspace-catalog.json`

The file is managed by:

- `src/interface/CLI/core/catalogStorage.ts`

## Architectural Notes

- The CLI is a developer tool and does not replace domain use case implementation.
- It helps capture structured metadata for domain/entity evolution.
- It can be extended with additional sub applications for automation scenarios.

## Quality

CLI behavior is covered by unit tests under:

- `test/unit/interface/CLI/`

This ensures new CLI features and flows remain stable and coverage-compliant.

## Related Service Management UI

The visual design surface moved to:

- `service-management/`

See:

- `documentation/md/SERVICE-MANAGEMENT-APPLICATION.md`
