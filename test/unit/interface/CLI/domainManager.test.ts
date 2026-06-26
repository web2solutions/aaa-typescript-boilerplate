import { domainManagerSubApplication } from '@src/interface/CLI/subapps/domainManager';
import { IWorkspaceCatalog } from '@src/interface/CLI/types';

describe('cli domain manager', () => {
  const createContext = (catalog: IWorkspaceCatalog, chooseQueue: number[], askQueue: string[]) => {
    const logs: string[] = [];
    let chooseIndex = 0;
    let askIndex = 0;
    const saveCatalog = jest.fn().mockResolvedValue(undefined);

    return {
      context: {
        choose: jest.fn().mockImplementation(async () => {
          const value = chooseQueue[chooseIndex];
          chooseIndex += 1;
          return value;
        }),
        ask: jest.fn().mockImplementation(async () => {
          const value = askQueue[askIndex] || '';
          askIndex += 1;
          return value;
        }),
        log: (message: string) => {
          logs.push(message);
        },
        loadCatalog: jest.fn().mockResolvedValue(catalog),
        saveCatalog
      },
      logs,
      saveCatalog
    };
  };

  it('runs list/search/create/update/delete flow', async () => {
    expect.hasAssertions();
    const catalog: IWorkspaceCatalog = {
      version: 1,
      domains: [{
        id: 'd1',
        name: 'Users',
        description: 'users domain',
        boundedContext: 'identity',
        status: 'active',
        tags: ['core'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      entities: []
    };

    const { context, logs, saveCatalog } = createContext(
      catalog,
      [0, 1, 2, 3, 0, 4, 1, 5],
      [
        'users',
        'Billing',
        'billing domain',
        'finance',
        'active',
        'core,finance',
        'Identity',
        '',
        '',
        'deprecated',
        '',
        'Billing'
      ]
    );

    await domainManagerSubApplication.run(context as any);

    expect(saveCatalog).toHaveBeenCalledTimes(3);
    expect(catalog.domains).toHaveLength(1);
    expect(catalog.domains[0].name).toBe('Identity');
    expect(catalog.domains[0].status).toBe('deprecated');
    expect(logs).toStrictEqual(expect.arrayContaining([
      'Domain "Billing" created.',
      'Domain "Identity" updated.',
      'Domain removed.'
    ]));
  });

  it('blocks delete when domain has related entities and handles empty update', async () => {
    expect.hasAssertions();
    const catalog: IWorkspaceCatalog = {
      version: 1,
      domains: [{
        id: 'd1',
        name: 'Users',
        description: '',
        boundedContext: '',
        status: 'active',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      entities: [{
        id: 'e1',
        name: 'User',
        domain: 'Users',
        kind: 'aggregate',
        description: '',
        fields: [],
        behaviors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    };

    const withEntity = createContext(catalog, [4, 0, 5], []);
    await domainManagerSubApplication.run(withEntity.context as any);

    expect(withEntity.saveCatalog).toHaveBeenCalledTimes(0);
    expect(withEntity.logs.some((item) => item.includes('Remove or reassign'))).toBe(true);

    const emptyCatalog: IWorkspaceCatalog = { version: 1, domains: [], entities: [] };
    const emptyUpdate = createContext(emptyCatalog, [3, 5], []);
    await domainManagerSubApplication.run(emptyUpdate.context as any);
    expect(emptyUpdate.logs).toContain('No domains available.');
  });

  it('covers validation and duplicate/cancel branches', async () => {
    expect.hasAssertions();
    const catalog: IWorkspaceCatalog = {
      version: 1,
      domains: [{
        id: 'd1',
        name: 'Users',
        description: '',
        boundedContext: '',
        status: 'active',
        tags: ['core'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      entities: []
    };

    const run = createContext(
      catalog,
      [1, 2, 2, 3, 0, 4, 0, 5],
      [
        'zzz',
        '',
        '',
        '',
        'unknown',
        '',
        'Users',
        '',
        '',
        '',
        '',
        '',
        'wrong-confirmation'
      ]
    );

    await domainManagerSubApplication.run(run.context as any);

    expect(run.logs).toStrictEqual(expect.arrayContaining([
      'No matching domains.',
      'Domain name is required.',
      'Domain "Users" already exists.',
      'Domain name is required.',
      'Delete cancelled.'
    ]));
  });

  it('covers empty list and delete with missing domain index', async () => {
    expect.hasAssertions();
    const emptyCatalog: IWorkspaceCatalog = { version: 1, domains: [], entities: [] };
    const run = createContext(emptyCatalog, [0, 4, 5], []);

    await domainManagerSubApplication.run(run.context as any);

    expect(run.logs).toStrictEqual(expect.arrayContaining([
      'No domains registered yet.',
      'No domains available.'
    ]));
  });
});
