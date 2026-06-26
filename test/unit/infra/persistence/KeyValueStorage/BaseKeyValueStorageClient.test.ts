/* eslint-disable class-methods-use-this */
import { BaseKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/BaseKeyValueStorageClient';

class TestKeyValueStorageClient extends BaseKeyValueStorageClient {
  public async get(): Promise<any> { return { result: undefined }; }

  public async del(): Promise<any> { return { result: true }; }

  public async set(): Promise<any> { return { result: true }; }
}

describe('base key value storage client', () => {
  it('toggles connection state', async () => {
    expect.hasAssertions();
    const client = new TestKeyValueStorageClient();
    expect(client.connected).toBe(false);
    const connected = await client.connect();
    expect((connected.result as any).connected).toBe(true);
    const disconnected = await client.disconnect();
    expect((disconnected.result as any).connected).toBe(false);
  });
});
