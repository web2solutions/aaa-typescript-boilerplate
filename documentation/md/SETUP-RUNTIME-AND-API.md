# Setup, Runtime, and API

## Runtime and Required Stack

- Node.js `22.x` and npm
- TypeScript
- Jest
- Redis (mutex support, optional local via Docker)
- RabbitMQ or BullMQ/Redis (optional, for `MessageMediator` adapter)
- OpenAPI typings
- YAML parser
- PM2

## Setup

Install dependencies:

```bash
npm install
```

Run Redis (if needed):

```bash
npm run docker:composeredis
```

Run messaging services (RabbitMQ + Redis) with Docker:

```bash
npm run docker:composemessaging
```

Run only RabbitMQ (useful when Redis is already running):

```bash
npm run docker:composerabbit
```

## Message Mediator Adapter

The mediator can be selected via environment variable:

```bash
AAA_MESSAGE_MEDIATOR_ADAPTER=inmemory # default
AAA_MESSAGE_MEDIATOR_ADAPTER=rabbitmq
AAA_MESSAGE_MEDIATOR_ADAPTER=bullmq
```

RabbitMQ required variables:

```bash
AAA_RABBITMQ_URL=amqp://guest:guest@127.0.0.1:5672
AAA_RABBITMQ_EXCHANGE=app.events
AAA_RABBITMQ_REQUEST_QUEUE=app.requests
AAA_RABBITMQ_PREFETCH=10
```

BullMQ required variables:

```bash
AAA_BULLMQ_REDIS_HOST=127.0.0.1
AAA_BULLMQ_REDIS_PORT=6379
AAA_BULLMQ_REDIS_DB=1
AAA_BULLMQ_REQUEST_QUEUE=app.requests
```

## API Documentation

- UI: <http://localhost:3000/OASdoc/>
- JSON: <http://localhost:3000/docs/1.0.0>
- AsyncAPI UI: <http://localhost:3000/AsyncAPIdoc/>
- AsyncAPI JSON index: <http://localhost:3000/docs/asyncapi/versions>

For VM profiles, services are orchestrated through PM2.
`REST`, `WebSocket`, and `gRPC` run as separated processes/ports in combined profiles.
Start the selected PM2 profile before opening documentation URLs.

## PM2 Runtime Profiles (VM)

Runtime adapter selection is environment-driven through:

```bash
AAA_HTTP_FRAMEWORK=express
AAA_REALTIME_API=no
AAA_REALTIME_API_PROTOCOL=websocket
AAA_REALTIME_API_DATABASE_DRIVER=Mongo
```

Detailed runtime contract:

- [Runtime Environment Contracts](./RUNTIME-ENVIRONMENT-CONTRACTS.md)

Startup entrypoints used by PM2:

- `apps/backend-template/src/interface/HTTP/adapters/start-rest-api.ts`
- `apps/backend-template/src/interface/WebSocket/adapters/start-websocket-api.ts`
- `apps/backend-template/src/interface/gRPC/adapters/start-grpc-api.ts`

Behavior summary:

- `start-rest-api.ts` resolves `AAA_HTTP_FRAMEWORK` and starts the configured HTTP adapter.
- `start-websocket-api.ts` starts only when `AAA_REALTIME_API=yes` and `AAA_REALTIME_API_PROTOCOL=websocket`.
- `start-grpc-api.ts` starts only when `AAA_REALTIME_API=yes` and `AAA_REALTIME_API_PROTOCOL=grpc`.

Dev (auto-starts `service-management`):

```bash
npm run pm2:start:dev:restapi
npm run pm2:start:dev:websocket-rest
npm run pm2:start:dev:grpc-rest
```

Staging:

```bash
npm run pm2:start:staging:restapi
npm run pm2:start:staging:websocket-rest
npm run pm2:start:staging:grpc-rest
```

Production:

```bash
npm run pm2:start:prod:restapi
npm run pm2:start:prod:websocket-rest
npm run pm2:start:prod:grpc-rest
```

PM2 operations:

```bash
npm run pm2:list
npm run pm2:logs
npm run pm2:stop:all
npm run pm2:delete:all
```

Service Management can read and persist these runtime env values through:

- `GET /api/runtime/env?environment=dev|staging|ci`
- `POST /api/runtime/env`

`POST /api/runtime/env` payload example:

```json
{
  "environment": "dev",
  "values": {
    "AAA_HTTP_FRAMEWORK": "express",
    "AAA_REALTIME_API": "yes",
    "AAA_REALTIME_API_PROTOCOL": "websocket",
    "AAA_REALTIME_API_DATABASE_DRIVER": "Mongo"
  }
}
```

Response payload example:

```json
{
  "environment": "dev",
  "fileName": ".env.dev",
  "values": {
    "AAA_HTTP_FRAMEWORK": "express",
    "AAA_REALTIME_API": "yes",
    "AAA_REALTIME_API_PROTOCOL": "websocket",
    "AAA_REALTIME_API_DATABASE_DRIVER": "Mongo"
  }
}
```

## Single Adapter Boot Commands (via PM2)

HTTP adapters (all routed through `start-rest-api` loader with `AAA_HTTP_FRAMEWORK`):

```bash
npm run dev:express
npm run dev:fastify
npm run dev:restify
npm run dev:hyper-express
npm run dev:cloudflare-workers
npm run dev:vercel-functions
npm run dev:loopback
npm run dev:sails-js
npm run dev:feathers
npm run dev:derby-js
npm run dev:adonis-js
npm run dev:total-js
```

Generic REST loader commands:

```bash
# uses AAA_HTTP_FRAMEWORK from env file (default express)
npm run dev:http
npm run prod:http
```

Equivalent direct loader style:

```bash
AAA_HTTP_FRAMEWORK=fastify pm2 start ./apps/backend-template/src/interface/HTTP/adapters/start-rest-api.ts --name aaa-dev-fastify --interpreter node --node-args='-r ts-node/register -r tsconfig-paths/register --env-file=./apps/backend-template/src/config/.env.dev' --update-env
AAA_HTTP_FRAMEWORK=cloudflare-workers pm2 start ./apps/backend-template/src/interface/HTTP/adapters/start-rest-api.ts --name aaa-dev-cloudflare-workers --interpreter node --node-args='-r ts-node/register -r tsconfig-paths/register --env-file=./apps/backend-template/src/config/.env.dev' --update-env
```

Combined service profiles:

```bash
npm run dev:websocket
npm run dev:grpc
npm run test:integration:service-management
```

Serverless dev mode:

```bash
npm run dev:serverless
```

Developer automation CLI:

```bash
npm run dev:cli
```

Service Management app (PM2-served):

```bash
npm run dev:service-management
```

![serverless dev mode](../images/sls.png "serverless dev mode")

## Production Commands

All `prod:*` adapter commands now boot through PM2 and route through `start-rest-api` loader.
Use `pm2:start:prod:*` profiles for separated REST/WebSocket/gRPC orchestration.

## Lambda Handlers Coverage

The AWS Lambda users/auth adapter now provides handlers for all Users/Auth OpenAPI operations:

- `login`
- `logout`
- `register`
- `updateUserPassword`
- `create`
- `getAll`
- `deleteOne`
- `update`
- `getOneById`
- `updatePassword`
- `createEmail`
- `updateEmail`
- `deleteEmail`
- `createDocument`
- `updateDocument`
- `deleteDocument`
- `createPhone`
- `updatePhone`
- `deletePhone`

## Adapter Implementation Notes

- `Cloudflare Workers` uses a serverless fetch dispatcher and reuses lambda operation contracts.
- `Vercel Functions` uses request/response function wrapping (without Express server bootstrap).
- `LoopBack`, `Sails`, `Feathers`, `Derby`, `Adonis`, and `Total` adapters run with framework-native server bootstraps/adapters.
- HTTP handler resolution in `RestAPI` still falls back to `express` operation handlers when a framework-specific handler is intentionally not present, preserving endpoint contract parity.
