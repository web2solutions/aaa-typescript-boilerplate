# Users Entity Contract (`IUser`)

## Purpose
`IUser` defines the domain entity shape used across repository/service/use-case boundaries for the Users domain.

## Source of truth
- `src/modules/Users/domain/Entity/IUser.ts`

## Contract fields

| Field | Type | Required | Format / semantics | Validation owner |
|---|---|---|---|---|
| `id` | `string` | Yes | UUID string | Domain model / BaseModel |
| `firstName` | `string` | Yes | Free text | Domain model (`canNotBeEmpty`) |
| `lastName` | `string` | Yes | Free text (can be empty string) | Domain model |
| `avatar` | `string` | Yes | Avatar filename/path | Domain model (`canNotBeEmpty` when set) |
| `username` | `string` | Yes | Login identifier | Domain model (`canNotBeEmpty`), auth/service constraints |
| `password` | `string` | Yes | Hash at rest | Service/security layers |
| `emails` | `EmailValueObject[]` | Yes | Collection of user emails | `EmailValueObject` |
| `documents` | `DocumentValueObject[]` | No | Collection of user documents | `DocumentValueObject` |
| `phones` | `PhoneValueObject[]` | No | Collection of user phones | `PhoneValueObject` |
| `roles` | `string[]` | Yes | Authorization role slugs | Auth/service layer |

## Notes
- `salt` is part of `User` model internals but intentionally not part of `IUser` contract.
- `documents` and `phones` are optional in contract for backward compatibility with historical payloads.
- API serialization is managed by service layer sanitization to prevent secret leakage (`password`, `salt`).

