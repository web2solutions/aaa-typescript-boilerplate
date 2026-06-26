# Users Domain Value Objects

## Scope
Value objects used by the Users domain:
- `EmailValueObject`
- `DocumentValueObject`
- `PhoneValueObject`

## Source of truth
- `src/modules/ddd/valueObjects/EmailValueObject.ts`
- `src/modules/ddd/valueObjects/DocumentValueObject.ts`
- `src/modules/ddd/valueObjects/PhoneValueObject.ts`
- `src/modules/ddd/valueObjects/EEmailType.ts`
- `src/modules/ddd/valueObjects/EDocumentType.ts`

---

## `DocumentValueObject`

### Intent
Represents a user document payload with normalized, immutable attributes and constructor-level invariants.

### Constructor payload
`IDocumentValueObjectPayload`:

| Field | Type | Required | Normalization | Validation |
|---|---|---|---|---|
| `id` | `string` | No | UUID parse if provided, generated if absent | UUID parse/generation |
| `type` | `EDocumentType \| string` | Yes | trimmed; supports enum values and `'PASSPORT'` alias | must be one of `CPF`, `RG`, `SSN`, `passport` |
| `countryIssue` | `string` | Yes | trimmed + uppercased | must not be empty |
| `data` | `string` | Yes | trimmed | must not be empty |

### Behavioral semantics
- Immutable attributes (`readonly`).
- Constructor-level normalization + invariant validation centralize value-object consistency.

### DDD note
This project keeps a technical `id` for document list update/delete operations. Business value still relies on normalized `type/countryIssue/data`.

---

## `EmailValueObject`

| Field | Type | Required | Normalization | Validation |
|---|---|---|---|---|
| `id` | `string` | No | UUID parse/generate | UUID parse/generation |
| `email` | `string` | Yes | none | `canNotBeEmpty('email')` |
| `type` | `EEmailType` | Yes | none | `canNotBeEmpty('type')` |
| `isPrimary` | `boolean` | No | coercion with `!!isPrimary` | defaults to `false` |

---

## `PhoneValueObject`

| Field | Type | Required | Normalization | Validation |
|---|---|---|---|---|
| `id` | `string` | No | UUID parse/generate | UUID parse/generation |
| `countryCode` | `string` | Yes | none | `canNotBeEmpty('countryCode')` |
| `localCode` | `string` | Yes | none | `canNotBeEmpty('localCode')` |
| `number` | `string` | Yes | none | `canNotBeEmpty('number')` |
| `isPrimary` | `boolean` | No | coercion with `!!isPrimary` | defaults to `false` |

## OpenAPI alignment notes
- OpenAPI still models phone codes as `integer`, while domain uses `string`.
- OpenAPI document type enums may lag domain enum (`passport` support in domain).
