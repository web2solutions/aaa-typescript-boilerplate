# Domain Designer MVP Roadmap

This document centralizes Domain Designer MVP status and priorities.

Canonical backlog source:

- `.agents/project-todos.md` (section: `Domain Designer MVP Backlog`)

## Delivered MVP increments

- Visual domain canvas with color-coded domain blocks
- Entity lifecycle (`create`, `rename`, `delete`, `duplicate`, `move`)
- Relationship lifecycle with pick-on-canvas mode
- Relationship productivity helpers:
  - smart naming
  - auto-FK generation for cardinal links
  - N:N junction auto-generation
  - relationship reverse action
  - routing style switch (`curved` / `orthogonal`)
- OpenAPI-aware field editor with constraints metadata
- Field templates (`tenantRef`, `auditTrail`, `softDelete`, `contactPack`)
- JSON + OpenAPI export/import baseline
- Canvas UX improvements:
  - pan/zoom/fit/reset
  - compact mode
  - snap-to-grid
  - keyboard nudge
  - undo/redo
- Model checks with actionable issue focus
- CRUD endpoint preview in entity inspector
- Anchor-based drag-and-drop relationship connectors
- Bounded-context metadata editor per domain
- Relationship label positioning controls (offset editor + reset)
- Advanced relationship path controls (bend points + anchor behavior)
- Aggregate root and invariant editor
- Schema diff and migration preview
- Validation severity levels and export quality gate
- RBAC mapping editor per entity/action
- Event/message contract designer tied to entities
- Code generation preview pane
- Entity templates and scaffolding packs (`crudAggregate`, `eventSourced`, `referenceData`, `tenantOwned`)
- Pluggable exporters (JSON, OAS 3.1, Markdown, JSON Schema, AsyncAPI, Boilerplate bundle)
- Advanced OpenAPI composition builder (`oneOf`, `allOf`, `anyOf`, external `$ref`, discriminator)
- Collaborative model package support (domain package import/export, dependencies, shared value objects)
- Request/response example generator from entity schema
- Visual mini-map and large-canvas performance mode
- Starter e2e/smoke coverage for Domain Designer workflows

## Next MVP priorities

- MVP roadmap completed.

## Post-MVP enhancements

- Collaborative package versioning and semantic dependency conflict resolution

## Documentation and governance rules

- Every Domain Designer feature must update:
  - `servicemangement/README.md`
  - this roadmap (when scope or priority changes)
  - relevant README/document index links
- Every newly identified MVP item must be added to backlog tracking before or along with implementation.
