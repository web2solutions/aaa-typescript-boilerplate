# Domain Designer Features and Usage

This document is the technical guide for all Domain Designer MVP capabilities inside:

- `service-management/`

It covers what each feature does and how to use it in practice.

## 1) Canvas and Navigation

Features:

- Domain rectangles (color-coded)
- Entity cards inside domains
- Pan, zoom, fit, reset
- Snap-to-grid
- Compact/full view
- Large-canvas performance mode
- Mini-map navigation
- Undo/redo

How to use:

1. Create domains and entities from the left panel.
2. Drag domain headers and entity headers to reposition.
3. Use:
   - `Ctrl/Cmd + mouse wheel` for zoom
   - `Space + drag` for panning
   - `Fit` and `Reset View` for quick framing
4. Turn on `Large Canvas` for high-density diagrams.
5. Use the mini-map to focus a domain quickly.

## 2) Relationship Design

Features:

- Form-based relationship creation (`from`, `to`, cardinality)
- Pick-on-canvas mode
- Anchor-to-anchor drag connectors
- Relationship reverse
- Auto FK generation
- Label offset controls (`x`, `y`)
- Bend path controls (`bendX`, `bendY`)
- Anchor behavior (`auto`, `center`)
- Routing style (`curved`, `orthogonal`)

How to use:

1. Select source and target entities and click `Connect`.
2. Or click `Pick On Canvas` and select entities directly.
3. For anchor-aware connections, drag from edge anchors (`top/right/bottom/left`) between entities.
4. Select a relationship in the list and tune:
   - label offset
   - bend points
   - anchor behavior
5. Click `Save Relationship`.

## 3) Domain Context Metadata

Per-domain metadata:

- Ubiquitous language
- Owner team
- Upstream dependencies
- Downstream dependencies
- Integration channel
- Package dependencies
- Shared value objects

How to use:

1. Select a domain.
2. Fill values in `Bounded Context`.
3. Click `Save Context`.

These fields are persisted in the designer state and exported through JSON/package flows.

## 4) Entity Editing and Templates

Entity-level features:

- Rename, move, duplicate, delete
- Aggregate root flag
- Invariants editor
- Field CRUD with OpenAPI-aligned metadata
- Field templates (`tenantRef`, `auditTrail`, `softDelete`, `contactPack`)
- Entity templates:
  - `crudAggregate`
  - `eventSourced`
  - `referenceData`
  - `tenantOwned`

How to use:

1. Select an entity.
2. Use Entity Inspector for rename/move/rules.
3. Add fields manually or apply field templates.
4. Apply entity templates from `Entities` panel.

## 5) RBAC Policy Mapping

Per-entity action policy:

- Actions:
  - `list`
  - `getById`
  - `create`
  - `update`
  - `delete`
- Role toggles:
  - `superadmin`
  - `admin`
  - `user`
- Tenant scope flag

How to use:

1. Select entity and action.
2. Mark allowed roles and tenant scope.
3. Click `Save RBAC Rule`.
4. Review generated matrix in the RBAC list.

## 6) Message Contract Designer

Supported contract types:

- `event`
- `command`
- `request`
- `response`

Contract fields:

- name
- type
- channel/topic
- version
- payload schema (JSON editor)

How to use:

1. Select entity.
2. Fill contract name/type/channel/version.
3. Click `Add Contract`.
4. Use `payload` button to edit schema JSON.

Exports include these contracts in:

- OpenAPI extension (`x-message-contracts`)
- AsyncAPI export

## 7) OpenAPI Advanced Composition

Per-entity controls:

- `oneOf`, `allOf`, `anyOf`
- schema refs list
- external `$ref` list
- discriminator property

How to use:

1. Select entity.
2. Choose composition mode.
3. Add schema refs and optional external refs.
4. Define discriminator if needed.
5. Save composition.

## 8) Validation, Quality Gate, and Diff

Features:

- Model checks with severity:
  - `error`
  - `warn`
  - `info`
- Configurable minimum severity filter
- Export block on critical issues
- Schema baseline save/clear
- Schema diff and migration hints

How to use:

1. Click `Validate Model`.
2. Adjust severity filter if needed.
3. Enable `block export on critical issues` to enforce quality gate.
4. Save a baseline, then run diff to detect changes.

## 9) Example and Code Generation

Generated outputs:

- Request/response payload examples
- Code skeleton preview:
  - model
  - repository port
  - use case
  - controller
  - handler

How to use:

1. Select an entity for focused output, or keep none selected for full-canvas output.
2. Click:
   - `Generate Examples`
   - `Code Preview`

## 10) Export and Import Targets

Export:

- JSON model
- OpenAPI 3.1
- Markdown
- JSON Schema
- AsyncAPI
- Boilerplate bundle
- Domain package

Import:

- JSON model
- OpenAPI 3.1
- Domain package

How to use:

1. Use export buttons in `Export` panel.
2. Use import buttons for JSON/OAS/package.
3. For package export, selected domain is used as source package.

## 11) Smoke Coverage

Service Management smoke tests:

- `test/integration/ServiceManagement/domainDesigner.smoke.test.ts`
- `test/unit/service-management/mvp.roadmap.features.test.ts`

Run:

```bash
npm run test:integration:service-management
NODE_ENV=dev npx jest test/unit/service-management/mvp.roadmap.features.test.ts --runInBand
```
