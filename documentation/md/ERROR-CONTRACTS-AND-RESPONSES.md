# Error Contracts and HTTP Error Responses

This document defines how errors are represented in code and serialized through HTTP adapters.

## 1) Base Error Contract

All domain/infra errors extend `BaseError` (`src/infra/exceptions/BaseError.ts`) and expose:

```ts
{
  name: string;
  code: string; // EErrorStringCodes
  message: string;
  correlationId: string;
  cause?: Error;
  metadata?: unknown;
}
```

## 2) Canonical Error Codes

Defined in `src/infra/exceptions/error.codes.ts`:

| String Code | HTTP Status |
|---|---|
| `GENERIC.INVALID_INPUT` | `400` |
| `GENERIC.NOT_FOUND` | `404` |
| `GENERIC.UNAUTHORIZED` | `401` |
| `GENERIC.FORBIDDEN` | `403` |
| `GENERIC.CONFLICT` | `409` |
| `GENERIC.RESOURCE_LOCKED` | `423` |
| `GENERIC.NOT_IMPLEMENTED` | `501` |
| `GENERIC.INTERNAL_SERVER_ERROR` | `500` |

Status mapping is resolved by `toHttpStatus(...)` in `src/shared/utils.ts`.

## 3) Error Class to Code Mapping

| Error Class | Name | Code |
|---|---|---|
| `ValidationError` | `validation_error` | `GENERIC.INVALID_INPUT` |
| `DomainValidationError` | `domain_validation_error` | `GENERIC.INVALID_INPUT` |
| `ComposeEventError` | `event_invalid_message` | `GENERIC.INVALID_INPUT` |
| `DatabasePagingError` | `database_paging_error` | `GENERIC.INVALID_INPUT` |
| `UnauthorizedError` | `unauthorized` | `GENERIC.UNAUTHORIZED` |
| `ForbiddenError` | `forbidden` | `GENERIC.FORBIDDEN` |
| `NotFoundError` | `not_found` | `GENERIC.NOT_FOUND` |
| `DomainNotFoundError` | `domain_not_found` | `GENERIC.NOT_FOUND` |
| `DataBaseNotFoundError` | `database_not_found` | `GENERIC.NOT_FOUND` |
| `ConflictError` | `database_duplicated` | `GENERIC.CONFLICT` |
| `ResourceLockedError` | `locked_resource` | `GENERIC.RESOURCE_LOCKED` |
| `NotImplemented` | `infrastructure_not_implemented` | `GENERIC.NOT_IMPLEMENTED` |
| `InternalServerError` | `internal_server_error` | `GENERIC.INTERNAL_SERVER_ERROR` |

## 4) HTTP Error Response Shape

Current adapters serialize to the same payload shape:

```json
{
  "message": "Human readable message",
  "error": {
    "name": "error_name",
    "code": "GENERIC.SOME_CODE",
    "message": "Original message",
    "correlationId": "..."
  }
}
```

Sources:
- Express/Fastify/Restify/Hyper-Express: `sendErrorResponse(...)`
- Lambda adapters: `src/interface/HTTP/adapters/aws/lambda/responses/sendErrorResponse.ts`

## 5) MessageMediator Request/Response Error Contract

For contract-based inter-service calls:

```ts
interface IMessageResponse<TResult = any> {
  contract: string;
  result?: TResult;
  error?: Error | Record<string, any>;
}
```

Errors are carried in the same response envelope (no throw required at transport boundary).

## 6) Current Consistency Notes

1. Error status mapping is centralized (`toHttpStatus`).
2. Human-readable formatting is centralized (`formatErrorMessage`).
3. Correlation id is captured in `BaseError` from request context.
4. New adapters should reuse existing `sendErrorResponse` semantics to preserve response contract consistency.

## 7) Extension Rules

When creating a new custom error:

1. Extend `BaseError`.
2. Assign a stable `name` and `code`.
3. Ensure `code` is covered in `EErrorStringCodes`/`EErrorNumberCodes`.
4. Add `formatErrorMessage` branch if custom human-readable text is required.
5. Keep HTTP and message-level error envelopes backward-compatible.

## 8) Realtime Error Envelopes

WebSocket (`ApiResponse`):

```json
{
  "ok": false,
  "operationId": "createOrganization",
  "error": {
    "name": "validation_error",
    "message": "Invalid input data"
  }
}
```

gRPC (`AsyncApiResponse`):

```json
{
  "ok": false,
  "operationId": "createOrganization",
  "errorName": "validation_error",
  "errorMessage": "Invalid input data"
}
```

See transport-specific contract references:
- `documentation/md/contracts/WEBSOCKET-REALTIME-CONTRACTS.md`
- `documentation/md/contracts/GRPC-REALTIME-CONTRACTS.md`
