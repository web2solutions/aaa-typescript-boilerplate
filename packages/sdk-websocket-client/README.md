# @jumentix/sdk-websocket-client

WebSocket SDK client for the Socket.IO realtime API, driven by AsyncAPI WebSocket spec (`/spec/asyncapi/1.0.0.websocket.yml`).

## What it does

- Loads AsyncAPI websocket server metadata.
- Connects through Socket.IO (`/ws` path).
- Sends request envelope via `api:request`.
- Waits for callback response and returns typed result.

## Quick usage

```ts
import { WebSocketApiClient } from '@jumentix/sdk-websocket-client';

const client = new WebSocketApiClient('ws://localhost:3001');
client.connect();

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
pnpm --filter @jumentix/sdk-websocket-client build
```
