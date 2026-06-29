/* eslint-disable jest/no-untyped-mock-factory */
import { compileKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/compileKeyValueStorageClient';

jest.mock('@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient', () => ({
  InMemoryKeyValueStorageClient: { compile: jest.fn().mockReturnValue({ type: 'inmemory' }) }
}));

jest.mock('@src/infra/persistence/KeyValueStorage/RedisKeyValueStorageClient', () => ({
  RedisKeyValueStorageClient: { compile: jest.fn().mockReturnValue({ type: 'redis' }) }
}));

describe('compileKeyValueStorageClient', () => {
  it('returns in-memory adapter for in-memory aliases', () => {
    expect.hasAssertions();
    expect(compileKeyValueStorageClient('InMemory') as any).toStrictEqual({ type: 'inmemory' });
    expect(compileKeyValueStorageClient('memory') as any).toStrictEqual({ type: 'inmemory' });
    expect(compileKeyValueStorageClient('in-memory') as any).toStrictEqual({ type: 'inmemory' });
  });

  it('returns redis adapter by default', () => {
    expect.hasAssertions();
    expect(compileKeyValueStorageClient(undefined) as any).toStrictEqual({ type: 'redis' });
    expect(compileKeyValueStorageClient('redis') as any).toStrictEqual({ type: 'redis' });
    expect(compileKeyValueStorageClient('unknown') as any).toStrictEqual({ type: 'redis' });
  });
});
