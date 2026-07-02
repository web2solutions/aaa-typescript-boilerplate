# AGENTS - Technical Requirements Registry

This folder tracks technical requirements and implementation guardrails agreed for this project.

Global rule:

- Every new feature must include documentation updates (and README index links when applicable).
- Domain Designer/Service Management MVP ideas must be tracked in `.agents/project-todos.md` (`Open` and `Done`).

Each requirement has one dedicated file under:

- `.agents/requirements/`

Use these files as living constraints for future maintenance and feature development.

## Current requirement set

- [001-node-runtime-node22](requirements/001-node-runtime-node22.md)
- [002-build-compatibility](requirements/002-build-compatibility.md)
- [003-service-dependency-wiring](requirements/003-service-dependency-wiring.md)
- [004-singleton-factory-normalization](requirements/004-singleton-factory-normalization.md)
- [005-user-persistence-correctness](requirements/005-user-persistence-correctness.md)
- [006-secret-leak-prevention](requirements/006-secret-leak-prevention.md)
- [007-mutex-response-contract](requirements/007-mutex-response-contract.md)
- [008-openapi-route-resolution](requirements/008-openapi-route-resolution.md)
- [009-scripts-docs-drift](requirements/009-scripts-docs-drift.md)
- [010-lambda-shared-composition](requirements/010-lambda-shared-composition.md)
- [011-minimal-ci-gate](requirements/011-minimal-ci-gate.md)
- [012-circleci-npm-node-compatibility](requirements/012-circleci-npm-node-compatibility.md)
- [013-env-loader-ci-resilience](requirements/013-env-loader-ci-resilience.md)
- [014-codecov-coverage-integrity](requirements/014-codecov-coverage-integrity.md)
- [015-architecture-nfr-ddd-eda-hexagonal](requirements/015-architecture-nfr-ddd-eda-hexagonal.md)
- [016-layer-call-order-and-boundaries](requirements/016-layer-call-order-and-boundaries.md)
- [017-event-first-integration-and-circular-safety](requirements/017-event-first-integration-and-circular-safety.md)
- [018-project-documentation-and-structure-sync](requirements/018-project-documentation-and-structure-sync.md)
- [019-domain-data-entity-documentation-standard](requirements/019-domain-data-entity-documentation-standard.md)
- [020-coverage-threshold-approval-gate](requirements/020-coverage-threshold-approval-gate.md)
- [021-message-mediator-domain-worker-independence](requirements/021-message-mediator-domain-worker-independence.md)
- [022-document-value-object-ddd-alignment](requirements/022-document-value-object-ddd-alignment.md)
- [023-domain-model-entity-documentation-per-domain](requirements/023-domain-model-entity-documentation-per-domain.md)
- [024-readme-architecture-and-runtime-sync](requirements/024-readme-architecture-and-runtime-sync.md)
- [025-feature-documentation-mandatory](requirements/025-feature-documentation-mandatory.md)
- [026-openapi31-data-entity-model-compliance](requirements/026-openapi31-data-entity-model-compliance.md)
- [027-native-http-adapter-ownership](requirements/027-native-http-adapter-ownership.md)
- [028-integration-contract-maps](requirements/028-integration-contract-maps.md)
- [029-multi-tenancy-and-rbac-foundation](requirements/029-multi-tenancy-and-rbac-foundation.md)
- [030-inmemory-relational-nosql-behavior-parity](requirements/030-inmemory-relational-nosql-behavior-parity.md)
- [031-users-organization-and-address-value-object](requirements/031-users-organization-and-address-value-object.md)
- [032-entity-timestamps-domain-object-methods-and-oas-sync](requirements/032-entity-timestamps-domain-object-methods-and-oas-sync.md)
- [033-domain-designer-mvp-backlog-governance](requirements/033-domain-designer-mvp-backlog-governance.md)
- [034-domain-designer-oas31-er-alignment](requirements/034-domain-designer-oas31-er-alignment.md)
- [035-domain-designer-documentation-sync](requirements/035-domain-designer-documentation-sync.md)
- [036-openapi-port-objects-contracts](requirements/036-openapi-port-objects-contracts.md)
- [037-bootstrap-cli-scaffolding](requirements/037-bootstrap-cli-scaffolding.md)
- [038-service-management-tabbed-suite](requirements/038-service-management-tabbed-suite.md)
- [039-external-data-adapter-foundations](requirements/039-external-data-adapter-foundations.md)
- [040-platform-infrastructure-containers](requirements/040-platform-infrastructure-containers.md)
- [041-pm2-vm-runtime-orchestration](requirements/041-pm2-vm-runtime-orchestration.md)
- [042-env-driven-runtime-adapter-selection](requirements/042-env-driven-runtime-adapter-selection.md)
- [043-runtime-env-documentation-and-governance](requirements/043-runtime-env-documentation-and-governance.md)
- [044-pci-security-compliance-hardening](requirements/044-pci-security-compliance-hardening.md)
- [045-data-entity-controller-ownership](requirements/045-data-entity-controller-ownership.md)
- [046-multi-database-driver-smoke-validation](requirements/046-multi-database-driver-smoke-validation.md)
- [047-realtime-api-test-matrix](requirements/047-realtime-api-test-matrix.md)
- [048-jumentix-pnpm-monorepo-productization](requirements/048-jumentix-pnpm-monorepo-productization.md)
- [049-jumentix-wave-execution-governance](requirements/049-jumentix-wave-execution-governance.md)
- [050-generic-adapters-as-distributable-packages](requirements/050-generic-adapters-as-distributable-packages.md)
- [051-runtime-bootstrap-shared-packages](requirements/051-runtime-bootstrap-shared-packages.md)
- [052-rest-loader-framework-matrix](requirements/052-rest-loader-framework-matrix.md)
- [053-jumentix-workspace-package-docs-and-ownership](requirements/053-jumentix-workspace-package-docs-and-ownership.md)
- [054-sdk-compatibility-bridge-governance](requirements/054-sdk-compatibility-bridge-governance.md)
- [055-wave5-app-rehoming-cutover-governance](requirements/055-wave5-app-rehoming-cutover-governance.md)
- [056-jumentix-project-single-source-of-truth](requirements/056-jumentix-project-single-source-of-truth.md)
- [057-pr-grouping-by-priority](requirements/057-pr-grouping-by-priority.md)
- [058-jumentix-migration-inventory-and-rollback-governance](requirements/058-jumentix-migration-inventory-and-rollback-governance.md)
- [059-jumentix-service-factory-and-deploy-template-matrices](requirements/059-jumentix-service-factory-and-deploy-template-matrices.md)
- [Data Entity Documentation Agent](data-entity-documentation-agent.md)
- [Domain Modeling Agent](domain-modeling-agent.md)
- [Domain Designer Agent](domain-designer-agent.md)
- [Message Mediator Domain Agent](message-mediator-domain-agent.md)
- [Integration Contracts Agent](integration-contracts-agent.md)
- [Architecture Alignment Plan](architecture-alignment-plan.md)
