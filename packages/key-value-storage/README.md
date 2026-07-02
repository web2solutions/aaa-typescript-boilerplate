# @jumentix/key-value-storage

Reusable key-value storage adapters for JumentiX services.

Included:

- `IKeyValueStorageClient` contracts
- `InMemoryKeyValueStorageClient`
- `RedisKeyValueStorageClient`
- `compileKeyValueStorageClient` environment-driven selector

This package is designed for multi-service reuse and avoids per-service adapter duplication.
