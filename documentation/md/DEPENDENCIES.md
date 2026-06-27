# Dependencies

## Application

- bcryptjs
- jsonwebtoken
- openapi-types
- reflect-metadata
- uuid
- xss
- yaml

## Infra - Express server

- express
- body-parser
- cors
- helmet

## Infra - Fastify server

- fastify
- @fastify/cors
- @fastify/formbody
- @fastify/helmet
- @fastify/static

## Infra - Restify

- restify
- bunyan

## Infra - Hyper-Express server

- hyper-express
- live-directory

## Infra - Additional HTTP/runtime adapters

- Cloudflare Workers (serverless `fetch` adapter)
- Vercel Functions (`req/res` serverless adapter, `@vercel/node` types)
- LoopBack runtime adapter (`@loopback/rest` optional runtime dependency)
- Sails.js runtime adapter (`sails` optional runtime dependency)
- Feathers runtime adapter (`@feathersjs/feathers` and `@feathersjs/koa` optional runtime dependencies)
- Derby.js runtime adapter (`derby` optional runtime dependency)
- Adonis.js runtime bridge (`@adonisjs/http-server` optional runtime dependency)
- Total.js runtime bridge (`total4` optional runtime dependency)

These adapters are designed as runtime-selectable integration points and do not require Express server inheritance.

## Infra - AWS Lambda / serverless

- aws-lambda
- serverless

## Infra - Distributed key-value storage

- redis
