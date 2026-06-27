import { InMemoryRelationalStore } from '@src/infra/persistence/InMemoryDatabase/Stores/InMemoryRelationalStore';

interface IRecord {
  id: string;
  username: string;
  organization?: string;
}

describe('in memory relational store', () => {
  it('enforces unique indexes and relation lookup', async () => {
    expect.hasAssertions();
    const store = new InMemoryRelationalStore<IRecord>({
      uniqueIndexes: ['username'],
      caseInsensitiveUniqueIndexes: ['username'],
      relationIndexes: ['organization']
    });

    await store.create('1', { id: '1', username: 'john', organization: 'org-1' });
    await expect(store.create('2', { id: '2', username: 'JOHN', organization: 'org-2' }))
      .rejects
      .toThrow('username already in use');

    await store.create('2', { id: '2', username: 'mary', organization: 'org-1' });
    const byOrg = await store.getByRelation('organization', 'org-1');
    expect(byOrg).toHaveLength(2);
  });

  it('updates records and paginates filtered result', async () => {
    expect.hasAssertions();
    const store = new InMemoryRelationalStore<IRecord>();
    await store.create('1', { id: '1', username: 'john', organization: 'org-1' });
    await store.create('2', { id: '2', username: 'mary', organization: 'org-2' });
    await store.update('2', { id: '2', username: 'mary-updated', organization: 'org-2' });

    const page = await store.getAll({ organization: 'org-2' }, { page: 1, size: 10 });
    expect(page.total).toBe(1);
    expect(page.result[0].username).toBe('mary-updated');
    await expect(store.getAll({}, { page: 0, size: 10 })).rejects.toThrow('page must be greater than 0');
    await expect(store.getAll({}, { page: 3, size: 1 })).rejects.toThrow(
      'page number must be smaller than the number of total pages'
    );
  });

  it('covers relation index moves, cleanup and not found branches', async () => {
    expect.hasAssertions();
    const store = new InMemoryRelationalStore<IRecord>({
      relationIndexes: ['organization']
    });

    await expect(store.getOneById('missing')).rejects.toThrow('Record not found');
    await expect(store.update('missing', { id: 'missing', username: 'n/a' })).rejects.toThrow('Record not found');

    await store.create('1', { id: '1', username: 'john', organization: 'org-1' });
    await store.create('2', { id: '2', username: 'mary', organization: 'org-2' });
    await expect(store.create('1', { id: '1', username: 'again' })).rejects.toThrow('Duplicated id');

    await store.update('2', { id: '2', username: 'mary', organization: 'org-3' });
    await expect(store.getByRelation('organization', 'org-2')).resolves.toHaveLength(0);
    await expect(store.getByRelation('organization', 'org-3')).resolves.toHaveLength(1);
  });

  it('cleans relation indexes on delete and handles delete misses', async () => {
    expect.hasAssertions();
    const store = new InMemoryRelationalStore<IRecord>({
      relationIndexes: ['organization']
    });

    await store.create('2', { id: '2', username: 'mary', organization: 'org-3' });
    await store.delete('2');
    await expect(store.getByRelation('organization', 'org-3')).resolves.toHaveLength(0);
    await expect(store.delete('missing')).resolves.toBe(false);
  });
});
