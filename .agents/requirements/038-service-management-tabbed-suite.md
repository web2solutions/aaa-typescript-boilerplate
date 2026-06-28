# Requirement 038 - Service Management Tabbed Suite

## Context
The local modeling application must evolve from single-purpose Domain Designer into a broader service-management suite.

## Rules
1. Folder name must be `servicemangement` (as requested) and must host the management UI.
2. The application must expose tabbed sections:
   - Domain Designer
   - Communication Interface Designer
   - Service Configuration
   - Deploy Management
3. Existing Domain Designer MVP capabilities must remain functional.
4. New tabs must persist basic user-defined configuration in local state.

## Implementation Notes
- Static app entrypoint: `servicemangement/index.html`.
- Existing ER modeling behavior remains in `servicemangement/script.js`.
