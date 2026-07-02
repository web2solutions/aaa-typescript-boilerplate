import { compileKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/compileKeyValueStorageClient';
import { compileKeyValueStorageClient as compileFromPackage } from '@jumentix/key-value-storage';

const createMockClient = (driver?: string) => ({
  connected: true,
  get: jest.fn(async () => ({ result: driver ?? 'default' })),
  del: jest.fn(async () => ({ result: driver ?? 'default' })),
  set: jest.fn(async () => ({ result: driver ?? 'default' })),
  disconnect: jest.fn(async () => ({ result: { connected: false } })),
  connect: jest.fn(async () => ({ result: { connected: true } })),
  driver: driver ?? 'default'
});

jest.mock<typeof import('@jumentix/key-value-storage')>('@jumentix/key-value-storage', () => ({
  ...jest.requireActual('@jumentix/key-value-storage'),
  compileKeyValueStorageClient: jest.fn((driver?: string) => createMockClient(driver) as any)
}));

describe('compileKeyValueStorageClient', () => {
  it('forwards in-memory aliases to package compiler', () => {
    expect.hasAssertions();
    expect(compileKeyValueStorageClient('InMemory') as any).toMatchObject({ driver: 'InMemory' });
    expect(compileKeyValueStorageClient('memory') as any).toMatchObject({ driver: 'memory' });
    expect(compileKeyValueStorageClient('in-memory') as any).toMatchObject({ driver: 'in-memory' });
  });

  it('forwards redis/default aliases to package compiler', () => {
    expect.hasAssertions();
    expect(compileKeyValueStorageClient(undefined) as any).toMatchObject({ driver: 'default' });
    expect(compileKeyValueStorageClient('redis') as any).toMatchObject({ driver: 'redis' });
    expect(compileKeyValueStorageClient('unknown') as any).toMatchObject({ driver: 'unknown' });
    expect(compileFromPackage).toHaveBeenCalledTimes(6);
  });
});
