# Setup, Runtime, and API

## Runtime and Required Stack

- Node.js `22.x` and npm
- TypeScript
- Jest
- Redis (mutex support, optional local via Docker)
- RabbitMQ or BullMQ/Redis (optional, for `MessageMediator` adapter)
- OpenAPI typings
- YAML parser

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

Start the app before opening those URLs.

## Run the API (port 3000)

Express:

```bash
npm run dev:express
```

Fastify:

```bash
npm run dev:fastify
```

Restify:

```bash
npm run dev:restify
```

Hyper-Express:

```bash
npm run dev:hyper-express
```

Serverless dev mode:

```bash
npm run dev:serverless
```

Developer automation CLI:

```bash
npm run dev:cli
```

![serverless dev mode](../sls.png "serverless dev mode")

## Production Commands

```bash
npm run build:prod
npm run prod:express
npm run prod:fastify
npm run prod:restify
npm run prod:hyper-express
npm run prod:serverless
```
