# AWS Lambda Adapter

## Purpose

Deploy handlers as function-based services with Serverless.

## Entrypoints

- `src/interface/aws/lambda/handlers/`
- `src/interface/HTTP/adapters/serverless/*`

## Build a Service with Lambda

1. Implement controller/use case methods.
2. Create Lambda handlers mapping request to controller operation.
3. Configure deployment in `serverless` files.
4. Run local mode:

```bash
npm run dev:serverless
```

## Notes

- Keep RESTAPI fallback available for documentation/operational fallback.

