# Requirement 029 - Multi-tenancy and RBAC Foundation

## Requirement
The boilerplate must support both single-tenancy and multi-tenancy with baseline RBAC roles:

- `superadmin`
- `admin`
- `user`

Rule:
- except `superadmin`, all tenant users (`admin`, `user`) must belong to an organization.

## Why
Most products require tenant isolation and role-based authorization early, without hard-coupling the architecture to a single runtime or persistence provider.

## Status
Active

## Notes
- Users domain RBAC rules are centralized in `src/modules/Users/domain/security/Rbac.ts`.
- `User` model and auth flow enforce organization binding for tenant roles.
