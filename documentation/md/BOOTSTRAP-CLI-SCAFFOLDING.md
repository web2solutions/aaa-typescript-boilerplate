# Bootstrap CLI Scaffolding

This boilerplate now exposes an npm-installable bootstrap CLI command:

- `aaa-bootstrap`

The command clones `aaa-typescript-boilerplate` into a target folder and writes initial service profile metadata.

## Usage

Install globally (or run with `npx` from package registry):

```bash
npm install -g aaa-typescript-boilerplate
aaa-bootstrap
```

Local repository usage:

```bash
npm run cli:bootstrap
```

## Supported Scaffold Profiles

1. HTTP/REST server (OpenAPI/Swagger + static assets)
2. WebSocket server (+ static assets)
3. gRPC server (+ static assets)
4. GraphQL server (+ static assets)
5. Functions bundle (AWS/Google/Azure/Vercel/Cloudflare)

## Generated Metadata

After scaffolding, the CLI writes:

- `.aaa/service-profile.json`

Example fields:

- selected service type
- profile flags (`interface`, `functions`, `staticAssets`)
- repository and branch used for scaffold
- generation timestamp
