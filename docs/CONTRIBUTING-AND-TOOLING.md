# Contributing and Tooling

## Contributing

1. Create a branch.
2. Run TDD mode:

```bash
npm run tdd
```

3. Make your changes.
4. Commit using:

```bash
npm run commit
```

This command runs lint/tests and then opens commitizen flow.

## Tooling

Lint:

```bash
npm run lint
```

Lint + fix:

```bash
npm run lint:fix
```

Update changelog from git history:

```bash
npm run changelog:update
```

Validate changelog is synced:

```bash
npm run changelog:check
```

Architecture and contracts:

```bash
npm run deps:check-cycles
npm run arch:check-boundaries
npm run arch:check-users-legacy-imports
npm run oas:check-routes
```

Node runtime check:

```bash
npm run check-node-version
```

Smoke and CI gate:

```bash
npm run ci:smoke
npm run ci:gate
```
