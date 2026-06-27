# AGENTS - Technical Requirements Registry

This folder tracks technical requirements and implementation guardrails agreed for this project.

Global rule:

- Every new feature must include documentation updates (and README index links when applicable).

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
- [Data Entity Documentation Agent](data-entity-documentation-agent.md)
- [Domain Modeling Agent](domain-modeling-agent.md)
- [Message Mediator Domain Agent](message-mediator-domain-agent.md)
- [Integration Contracts Agent](integration-contracts-agent.md)
- [Architecture Alignment Plan](architecture-alignment-plan.md)
