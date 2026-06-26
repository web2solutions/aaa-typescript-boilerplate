import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';

describe('in-memory db client', () => {
  it('exposes stores and connect/disconnect operations', async () => {
    expect.hasAssertions();
    expect(InMemoryDbClient.stores.User).toBeDefined();
    await expect(InMemoryDbClient.connect()).resolves.toBeUndefined();
    await expect(InMemoryDbClient.disconnect()).resolves.toBeUndefined();
  });
});
