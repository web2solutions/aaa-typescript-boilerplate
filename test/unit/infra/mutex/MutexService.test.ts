import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';

describe('mutex service', () => {
  const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
  const mutexService = MutexService.compile(keyValueStorageClient);

  beforeAll(async () => {
    await keyValueStorageClient.connect();
  });

  afterAll(async () => {
    await keyValueStorageClient.disconnect();
  });

  it('should always return lock status using previouslyLocked key', async () => {
    expect.hasAssertions();
    const id = `${Date.now()}-${Math.random()}`;

    const firstLock = await mutexService.lock('user', id);
    const secondLock = await mutexService.lock('user', id);

    expect(firstLock.result.previouslyLocked).toBe(false);
    expect(secondLock.result.previouslyLocked).toBe(true);
    expect(firstLock.result.wasAlreadyLocked).toBeUndefined();
    expect(secondLock.result.wasAlreadyLocked).toBeUndefined();

    await mutexService.unlock('user', id);
  });
});
