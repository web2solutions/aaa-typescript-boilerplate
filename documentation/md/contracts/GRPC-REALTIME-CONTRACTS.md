# gRPC Realtime Contracts

Canonical contracts for gRPC realtime transport.

## Source of Truth

- `src/interface/gRPC/proto/async-api.proto`
- `spec/asyncapi/1.0.0.grpc.yml`
- `src/interface/gRPC/gRPCAPI.ts`

## Service Definition

```proto
service AsyncApiGateway {
  rpc Request (AsyncApiRequest) returns (AsyncApiResponse);
  rpc Exchange (stream AsyncApiRequest) returns (stream AsyncApiResponse);
}
```

## Message Contracts

```proto
message AsyncApiRequest {
  string version = 1;
  string operationId = 2;
  string authorization = 3;
  string inputJson = 4;
  string paramsJson = 5;
  string queryStringJson = 6;
  string metadataJson = 7;
  string requestId = 8;
  string clientId = 9;
}

message AsyncApiResponse {
  bool ok = 1;
  string version = 2;
  string operationId = 3;
  string resultJson = 4;
  string errorName = 5;
  string errorMessage = 6;
  string requestId = 7;
  string clientId = 8;
  string metadataJson = 9;
}
```

## Serialization Rules

1. `inputJson`, `paramsJson`, `queryStringJson`, and `metadataJson` are JSON-serialized strings.
2. `resultJson` is JSON-serialized output payload.
3. `requestId/clientId` can be provided directly and/or inside `metadataJson`.
4. Server normalizes and returns `requestId/clientId` in the response envelope.

## Error Contract

When `ok=false`, response carries:

```json
{
  "ok": false,
  "operationId": "updateOrganization",
  "errorName": "domain_validation_error",
  "errorMessage": "organization name is required"
}
```

Error semantics must follow:
- [Error Contracts and Responses](../ERROR-CONTRACTS-AND-RESPONSES.md)

## Operation Registry

`operationId` must be from:
- `spec/asyncapi/1.0.0.grpc.yml` (`components.schemas.GrpcRequest.properties.operationId.enum`)

## Stream Semantics

`Exchange` is a bidirectional stream where each request message receives one response message with matching `operationId` and correlation data.

## Contract Change Policy

1. Update `.proto` and AsyncAPI together.
2. Regenerate or validate SDK/client assumptions after contract changes.
3. Document any field additions/removals in this file and changelog.
