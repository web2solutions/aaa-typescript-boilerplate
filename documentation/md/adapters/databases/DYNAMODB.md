# DynamoDB Adapter

## Technology

AWS SDK DynamoDB client profile.

## Build Services with DynamoDB

1. Start local container:

```bash
npm run docker:up:dynamodb
```

2. Set env:

```bash
AAA_DATABASE_DRIVER=DynamoDB
AAA_DYNAMODB_ENDPOINT=http://127.0.0.1:8000
AAA_AWS_REGION=us-east-1
```

3. Start service adapter.

