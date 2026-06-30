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

## Next MVP priorities

- Anchor-based drag-and-drop relationship connectors
- Relationship label positioning and routing styles
- Bounded-context metadata editor per domain
- Aggregate root and invariant editor
- Schema diff and migration preview
- Event/message contract designer tied to entities
- RBAC mapping UI per entity/action
- Advanced OpenAPI composition builder (`oneOf`, `allOf`, `anyOf`)
- Code generation preview and pluggable exporters
- E2E smoke coverage for Domain Designer workflows

## Documentation and governance rules

- Every Domain Designer feature must update:
  - `servicemangement/README.md`
  - this roadmap (when scope or priority changes)
  - relevant README/document index links
- Every newly identified MVP item must be added to backlog tracking before or along with implementation.
