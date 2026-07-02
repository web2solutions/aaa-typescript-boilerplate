# @jumentix/sdk-grpc-client

gRPC SDK client for the realtime gateway, driven by AsyncAPI gRPC spec (`/spec/asyncapi/1.0.0.grpc.yml`).

## What it does

- Loads AsyncAPI gRPC server metadata.
- Loads `async-api.proto`.
- Creates gRPC client for `realtime.AsyncApiGateway`.
- Sends standardized request envelope.

## Quick usage

```ts
import { GrpcApiClient } from '@jumentix/sdk-grpc-client';

const client = new GrpcApiClient('localhost:3002');

const response = await client.request({
  operationId: 'createUser',
  input: {
    username: 'john',
    password: 'StrongPass#123'
  }
});
```

## Build

```bash
pnpm --filter @jumentix/sdk-grpc-client build
```
