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

  it('shows selected field details, edits behavior and adds openapi-compliant fields', async () => {
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
          type: 'string',
          required: true,
          format: 'uuid',
          defaultValue: '',
          validations: ['minLength:1'],
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
        0, // choose entity
        1, // view details
        0, // field index
        4, // edit behavior
        0, // field index
        2, // add field
        0, // type: string
        0, // format: none
        1, // validations: finish
        0, // list fields
        6, // back field manager
        6 // back main manager
      ],
      [
        'system-managed',
        'title',
        'y',
        '',
        'human-readable'
      ]
    );

    await entityModelManagerSubApplication.run(run.context as any);

    expect(run.saveCatalog.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(run.logs).toStrictEqual(expect.arrayContaining([
      'Field: id',
      '  type: string',
      '  format: uuid',
      'Field "id" behavior updated.',
      'Field "title" added.'
    ]));
  });

  it('handles empty field branches and allows adding validated field rules', async () => {
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
        fields: [],
        behaviors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    };

    const run = createContext(
      catalog,
      [
        5, // manage fields
        0, // choose entity
        1, // view details (no fields)
        3, // update field (no fields)
        4, // edit behavior (no fields)
        5, // delete field (no fields)
        2, // add field
        0, // type: string
        0, // format: none
        0, // validations: add
        0, // validation keyword: minLength
        1, // validations: finish
        6, // back field manager
        6 // back manager
      ],
      [
        'title',
        'y',
        '',
        '',
        '3'
      ]
    );

    await entityModelManagerSubApplication.run(run.context as any);

    expect(run.logs).toStrictEqual(expect.arrayContaining([
      'No fields defined.',
      'No fields to update.',
      'No fields to update behavior.',
      'No fields to delete.',
      'Field "title" added.'
    ]));
  });

  it('covers list/search/create/update/delete entity flow under openapi-compliant schema', async () => {
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
      entities: []
    };

    const run = createContext(
      catalog,
      [
        0, // list empty
        1, // search
        2, // create
        0, // kind: entity
        0, // domain: Users
        1, // search hit
        3, // update
        0, // select entity
        3, // kind: model
        1, // custom domain option
        4, // delete
        0, // select entity
        6 // back
      ],
      [
        'unknown',
        'Task',
        'Task description',
        'n',
        'create,read',
        'task',
        'TaskModel',
        'Billing',
        'Updated description',
        'read,update',
        'TaskModel'
      ]
    );

    await entityModelManagerSubApplication.run(run.context as any);

    expect(run.logs).toStrictEqual(expect.arrayContaining([
      'No entities/models registered.',
      'No matching entities/models.',
      'Entity/model "Task" created.',
      'Found 1 item(s):',
      'Entity/model "TaskModel" updated.',
      'Entity/model removed.'
    ]));
  });

  it('handles required name and required domain on creation', async () => {
    expect.hasAssertions();
    const emptyCatalog: IWorkspaceCatalog = {
      version: 1,
      domains: [],
      entities: []
    };

    const missingName = createContext(emptyCatalog, [2, 6], ['']);
    await entityModelManagerSubApplication.run(missingName.context as any);
    expect(missingName.logs).toContain('Name is required.');

    const missingDomain = createContext(emptyCatalog, [2, 0, 6], ['Task', '']);
    await entityModelManagerSubApplication.run(missingDomain.context as any);
    expect(missingDomain.logs).toContain('Domain is required.');
  });

  it('covers duplicate/add/update/delete field branches with openapi validation interactions', async () => {
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
        fields: [],
        behaviors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    };

    const run = createContext(
      catalog,
      [
        5, // manage fields
        0, // choose entity
        2, // add field
        0, // type: string
        0, // format: none
        0, // validations: add
        0, // keyword: minLength
        1, // validations: finish
        2, // add duplicate field
        0, // type: string
        0, // format: none
        1, // validations: finish
        3, // update field
        0, // choose field index
        2, // type: integer
        1, // format: int32
        0, // validations: add
        0, // keyword: minimum
        1, // validations: finish
        5, // delete field
        0, // choose field index
        6, // back field manager
        6 // back manager
      ],
      [
        'title',
        'y',
        '',
        '',
        '',
        'title',
        'y',
        '',
        '',
        '',
        '',
        '5',
        'indexed',
        '1'
      ]
    );

    await entityModelManagerSubApplication.run(run.context as any);

    expect(run.logs).toStrictEqual(expect.arrayContaining([
      'Validation "minLength" skipped because value is empty.',
      'Field "title" added.',
      'Field "title" already exists.',
      'Field "title" updated.',
      'Field "title" deleted.'
    ]));
    expect(run.saveCatalog.mock.calls.length).toBeGreaterThan(0);
  });

  it('covers delete cancellation branch', async () => {
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
        fields: [],
        behaviors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    };

    const run = createContext(catalog, [4, 0, 6], ['not-task']);
    await entityModelManagerSubApplication.run(run.context as any);

    expect(run.logs).toContain('Delete cancelled.');
    expect(run.saveCatalog).not.toHaveBeenCalled();
  });
});
