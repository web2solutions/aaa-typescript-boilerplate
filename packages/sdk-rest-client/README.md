# @jumentix/sdk-rest-client

REST SDK client driven by OpenAPI (`/spec/1.0.0.yml`) operationIds.

## What it does

- Loads OpenAPI spec from local `spec` folder.
- Resolves `operationId -> method/path`.
- Builds URL with path/query params.
- Executes request through native `fetch`.

## Quick usage

```ts
import { RestApiClient } from '@jumentix/sdk-rest-client';

const client = new RestApiClient('http://localhost:3000/api/1.0.0');

const response = await client.request({
  operationId: 'createUser',
  body: {
    username: 'john',
    password: 'StrongPass#123'
  }
});
```

## Build

```bash
pnpm --filter @jumentix/sdk-rest-client build
```
