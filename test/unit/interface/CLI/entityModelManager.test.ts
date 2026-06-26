import { entityModelManagerSubApplication } from '@src/interface/CLI/subapps/entityModelManager';
import { IWorkspaceCatalog } from '@src/interface/CLI/types';

describe('cli entity/model manager', () => {
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

  it('runs create/update/manage/delete flow', async () => {
    expect.hasAssertions();
    const catalog: IWorkspaceCatalog = {
      version: 1,
      domains: [{
        id: 'd1',
        name: 'Users',
        description: '',
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
      [
        0, // list when empty
        2, // create
        2, // kind = aggregate
        0, // domain = Users
        0, // list now has one entity
        5, // manage fields
        0, // choose entity index for manage fields
        0, // list fields
        2, // add field
        2, // add field (duplicate)
        3, // update field
        0, // choose field to update
        5, // delete field
        0, // choose field to delete
        6, // back from field manager
        3, // update entity/model
        0, // choose entity to update
        3, // kind=model
        1, // choose custom domain option
        4, // delete entity/model
        0, // choose entity to delete
        4, // delete entity/model again
        0, // choose entity to delete
        6 // back
      ],
      [
        'Task',
        'Task aggregate',
        'y',
        'id',
        'uuid',
        'y',
        '',
        '',
        'required',
        '',
        'n',
        'create,update',
        'id',
        'string',
        'y',
        '',
        '',
        '',
        '',
        'id',
        'uuid',
        'y',
        '',
        '',
        'required,min:3',
        'immutable',
        'TaskModel',
        'custom',
        'Task model',
        'list,search',
        'wrong-name',
        'TaskModel'
      ]
    );

    await entityModelManagerSubApplication.run(context as any);

    expect(saveCatalog.mock.calls.length).toBeGreaterThanOrEqual(4);
    expect(logs).toStrictEqual(expect.arrayContaining([
      'No entities/models registered.',
      'Entity/model "Task" created.',
      'Field "id" already exists.',
      'Entity/model "Task" updated.'
    ]));
  });

  it('covers field details listing and behavior edit for selected field', async () => {
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
        name: 'Task',
        domain: 'Users',
        kind: 'entity',
        description: '',
        fields: [{
          name: 'id',
          type: 'uuid',
          required: true,
          format: 'uuid',
          defaultValue: '',
          validations: ['required'],
          behavior: 'immutable'
        }],
        behaviors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    };

    const run = createContext(
      catalog,
      [
        5, // manage fields
        0, // select entity
        1, // view details
        0, // select field
        4, // edit behavior
        0, // select field
        6, // back field manager
        6 // back main
      ],
      [
        'system-managed'
      ]
    );

    await entityModelManagerSubApplication.run(run.context as any);

    expect(run.logs).toStrictEqual(expect.arrayContaining([
      'Field: id',
      '  type: uuid',
      '  required: yes',
      '  behavior: immutable',
      'Field "id" behavior updated.'
    ]));
    expect(catalog.entities[0].fields[0].behavior).toBe('system-managed');
  });

  it('handles empty selections and no-match search', async () => {
    expect.hasAssertions();
    const emptyCatalog: IWorkspaceCatalog = {
      version: 1,
      domains: [],
      entities: []
    };
    const firstRun = createContext(emptyCatalog, [1, 3, 4, 5, 6], ['abc']);
    await entityModelManagerSubApplication.run(firstRun.context as any);
    expect(firstRun.logs).toContain('No matching entities/models.');
    expect(firstRun.logs).toContain('No entities/models registered yet.');

    const secondRun = createContext(emptyCatalog, [2, 0, 6], ['', '']);
    await entityModelManagerSubApplication.run(secondRun.context as any);
    expect(secondRun.logs).toContain('Name is required.');
    expect(secondRun.saveCatalog).toHaveBeenCalledTimes(0);
  });

  it('covers missing domain and empty field branches', async () => {
    expect.hasAssertions();
    const catalog: IWorkspaceCatalog = {
      version: 1,
      domains: [],
      entities: []
    };

    const missingDomain = createContext(
      catalog,
      [2, 1, 6],
      ['Task', '', '']
    );
    await entityModelManagerSubApplication.run(missingDomain.context as any);
    expect(missingDomain.logs).toContain('Domain is required.');

    const fieldsCatalog: IWorkspaceCatalog = {
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
        name: 'Task',
        domain: 'Users',
        kind: 'entity',
        description: '',
        fields: [],
        behaviors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    };

    const manageEmptyFields = createContext(
      fieldsCatalog,
      [5, 0, 0, 3, 4, 5, 2, 2, 6, 6],
      [
        '',
        'title',
        'string',
        'y',
        '',
        '',
        '',
        ''
      ]
    );
    await entityModelManagerSubApplication.run(manageEmptyFields.context as any);

    expect(manageEmptyFields.logs).toStrictEqual(expect.arrayContaining([
      'No fields defined.',
      'No fields to update.',
      'No fields to update behavior.',
      'No fields to delete.',
      'Field "title" added.'
    ]));
  });

  it('covers search hit and delete success paths', async () => {
    expect.hasAssertions();
    const catalog: IWorkspaceCatalog = {
      version: 1,
      domains: [],
      entities: [{
        id: 'e1',
        name: 'Task',
        domain: 'Work',
        kind: 'entity',
        description: 'task item',
        fields: [{
          name: 'name',
          type: 'string',
          required: true,
          validations: []
        }],
        behaviors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    };
    const run = createContext(catalog, [1, 4, 0, 6], ['task', 'Task']);

    await entityModelManagerSubApplication.run(run.context as any);

    expect(run.logs).toStrictEqual(expect.arrayContaining([
      'Found 1 item(s):',
      'Entity/model removed.'
    ]));
  });
});
