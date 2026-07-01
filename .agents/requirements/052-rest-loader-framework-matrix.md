# 052 - REST Loader Framework Matrix

## Context

REST startup was previously split across many direct framework entrypoints, increasing coupling between scripts and adapter implementation files.

## Requirement

1. `start-rest-api` must support selecting all implemented HTTP frameworks via `AAA_HTTP_FRAMEWORK`.
2. Environment and PM2 startup scripts should prefer loader entrypoints over direct framework file execution.
3. Default behavior must remain backward compatible (`express` when no env is provided).

## Acceptance Criteria

- `resolveHTTPFramework` recognizes the full framework set.
- `start-rest-api` resolves and imports the framework adapter based on env.
- Unit tests cover at least express + one non-express framework path, plus unsupported values.
