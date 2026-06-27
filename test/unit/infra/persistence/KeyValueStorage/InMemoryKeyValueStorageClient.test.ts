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

  it('covers singleton compile and error branches', async () => {
    expect.hasAssertions();
    const first = InMemoryKeyValueStorageClient.compile();
    const second = InMemoryKeyValueStorageClient.compile();
    expect(second).toBe(first);

    const client = first as any;
    const getSpy = jest.spyOn(client.client, 'get').mockImplementation(() => {
      throw new Error('get-failed');
    });
    const getResult = await client.get('lock:error');
    expect(getResult.error).toBeDefined();
    getSpy.mockRestore();

    const delSpy = jest.spyOn(client.client, 'delete').mockImplementation(() => {
      throw new Error('del-failed');
    });
    const delResult = await client.del('lock:error');
    expect(delResult.error).toBeDefined();
    delSpy.mockRestore();

    const setSpy = jest.spyOn(client.client, 'set').mockImplementation(() => {
      throw new Error('set-failed');
    });
    const setResult = await client.set('lock:error', 'x');
    expect(setResult.error).toBeDefined();
    setSpy.mockRestore();
  });
});
