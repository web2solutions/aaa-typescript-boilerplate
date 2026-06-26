import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';

describe('in-memory key value storage', () => {
  it('connects, sets, gets, deletes and disconnects', async () => {
    expect.hasAssertions();
    const client = InMemoryKeyValueStorageClient.compile();

    const connected = await client.connect();
    expect((connected.result as any).connected).toBe(true);

    const setResult = await client.set('lock:u1', 'locked');
    expect(setResult.result).toBeDefined();

    const getResult = await client.get('lock:u1');
    expect(getResult.result).toBe('locked');

    const delResult = await client.del('lock:u1');
    expect(delResult.result).toBe(true);

    const disconnected = await client.disconnect();
    expect((disconnected.result as any).connected).toBe(false);
  });
});
