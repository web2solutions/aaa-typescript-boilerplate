# Setup, Runtime, and API

## Runtime and Required Stack

- Node.js `22.x` and npm
- TypeScript
- Jest
- Redis (mutex support, optional local via Docker)
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
