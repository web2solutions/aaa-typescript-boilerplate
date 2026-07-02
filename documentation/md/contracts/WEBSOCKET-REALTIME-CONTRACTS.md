# WebSocket Realtime Contracts

Canonical contracts for Socket.IO realtime transport.

## Source of Truth

- `spec/asyncapi/1.0.0.websocket.yml`
- `src/interface/WebSocket/WebSocketAPI.ts`

## Envelope: Request

```ts
interface ApiRequest {
  version?: string;
  operationId: string;
  authorization?: string;
  input?: Record<string, any>;
  params?: Record<string, any>;
  queryString?: Record<string, any>;
  metadata?: {
    requestId?: string;
    correlationId?: string;
    causationId?: string;
    [key: string]: any;
  };
}
```

## Envelope: Response

```ts
interface ApiResponse {
  ok: boolean;
  version?: string;
  operationId: string;
  result?: Record<string, any>;
  error?: {
    name?: string;
    message?: string;
  };
  metadata?: {
    requestId?: string;
    clientId?: string;
    channel?: string;
    [key: string]: any;
  };
}
```

## Channel Contracts

```txt
api:request                     -> generic request
api:response                    -> generic response
api:{operationId}:request       -> operation-specific request
api:{operationId}:response      -> operation-specific response
```

## Correlation Rules

1. Client SHOULD send `metadata.requestId`.
2. Server reuses provided `requestId` or generates one.
3. Server includes `metadata.requestId` in response.
4. Server includes `metadata.clientId` (socket id) and `metadata.channel`.

## Error Contract

When `ok=false`, response includes:

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

Error semantics must follow:
- [Error Contracts and Responses](../ERROR-CONTRACTS-AND-RESPONSES.md)

## Operation Registry

`operationId` must match the allowed operation list in:
- `spec/asyncapi/1.0.0.websocket.yml` (`components.schemas.ApiRequest.properties.operationId.enum`)

## Contract Change Policy

1. Update AsyncAPI file first.
2. Keep backward compatibility for envelope shape when possible.
3. Document new operation ids and response shapes in this file.
