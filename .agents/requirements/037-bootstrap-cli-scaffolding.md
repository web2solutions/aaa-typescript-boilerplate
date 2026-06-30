# Requirement 037 - Bootstrap CLI Scaffolding

## Context
Engineers should be able to install one CLI tool and scaffold a new project from this boilerplate.

## Rules
1. Bootstrap CLI must clone `aaa-typescript-boilerplate` from GitHub into the target workspace.
2. Bootstrap CLI must ask the engineer which service type to scaffold:
   - HTTP/REST server
   - WebSocket server
   - gRPC server
   - GraphQL server
   - Function services bundle
3. Scaffold output must persist the selected profile in project metadata.
4. Bootstrap flow must remain framework-agnostic and extensible.

## Implementation Notes
- CLI command: `aaa-bootstrap` (via package `bin` mapping).
- Bootstrap metadata file: `.aaa/service-profile.json`.
