import { ConflictError, DataBaseNotFoundError } from '@src/infra/exceptions';
import { ExternalStoreProxy } from '@src/infra/persistence/external/ExternalStoreProxy';
import { BaseExternalDataRepository } from '@src/infra/persistence/external/BaseExternalDataRepository';

class FakeConnector extends BaseExternalDataRepository {
  private readonly client: any;

  constructor(client: any, provider = 'fake-provider') {
    super({ provider });
    this.client = client;
    this.connected = true;
  }

  public async connect(): Promise<void> {
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public getClient(): any {
    return this.client;
  }
}

const createMongoClient = () => {
  const storage = new Map<string, any>();
  return {
    db: {
      collection: () => ({
        insertOne: async (doc: any) => {
          storage.set(doc._id, doc);
        },
        findOne: async (query: any) => storage.get(query._id) || null,
        updateOne: async (query: any, patch: any) => {
          const current = storage.get(query._id);
          if (!current) return { matchedCount: 0 };
          storage.set(query._id, { ...current, ...patch.$set });
          return { matchedCount: 1 };
        },
        deleteOne: async (query: any) => {
          const deleted = storage.delete(query._id);
          return { deletedCount: deleted ? 1 : 0 };
        },
        find: () => ({
          toArray: async () => [...storage.values()]
        })
      })
    }
  };
};

const createSqlClient = () => {
  const rows = new Map<string, any>();
  const model = {
    sync: jest.fn().mockResolvedValue(undefined),
    findByPk: jest.fn(async (id: string) => {
      const row = rows.get(id);
      if (!row) return null;
      return { get: () => row };
    }),
    findOne: jest.fn(async ({ where }: any) => {
      const entry = [...rows.values()].find((row) => (
        Object.entries(where).every(([key, value]) => row[key] === value)
      ));
      if (!entry) return null;
      return {
        get: (key?: string) => (key ? entry[key] : entry)
      };
    }),
    create: jest.fn(async (data: any) => {
      rows.set(data.id, data);
      return { get: () => data };
    }),
    update: jest.fn(async (data: any, { where }: any) => {
      const current = rows.get(where.id);
      rows.set(where.id, { ...current, ...data });
      return [1];
    }),
    destroy: jest.fn(async ({ where }: any) => (rows.delete(where.id) ? 1 : 0)),
    findAll: jest.fn(async () => [...rows.values()].map((row) => ({ get: () => row })))
  };

  return {
    Sequelize: {
      DataTypes: {
        STRING: 'string',
        JSON: 'json'
      }
    },
    models: {},
    define: jest.fn(() => model)
  };
};

const createSqlClientWithoutPayload = () => {
  const rows = new Map<string, any>();
  const model = {
    sync: jest.fn().mockResolvedValue(undefined),
    findByPk: jest.fn(async (id: string) => {
      const row = rows.get(id);
      if (!row) return null;
      return { get: () => row };
    }),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(async (data: any) => {
      rows.set(data.id, { id: data.id, username: data.username });
    }),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn(async ({ where }: any) => (rows.delete(where.id) ? 1 : 0)),
    findAll: jest.fn(async () => [...rows.values()].map((row) => ({ get: () => row })))
  };
  return {
    Sequelize: {
      DataTypes: { STRING: 'string', JSON: 'json' }
    },
    models: {},
    define: jest.fn(() => model)
  };
};

const createDynamoClient = () => {
  const items = new Map<string, any>();
  return {
    send: jest.fn(async (command: any) => {
      const input = command?.input || {};
      if (command.constructor.name === 'DescribeTableCommand') {
        return { Table: { TableName: input.TableName } };
      }
      if (command.constructor.name === 'CreateTableCommand') {
        return { TableDescription: { TableName: input.TableName } };
      }
      if (command.constructor.name === 'GetItemCommand') {
        return { Item: items.get(input.Key.id.S) };
      }
      if (command.constructor.name === 'PutItemCommand') {
        items.set(input.Item.id.S, input.Item);
        return {};
      }
      if (command.constructor.name === 'DeleteItemCommand') {
        const old = items.get(input.Key.id.S);
        items.delete(input.Key.id.S);
        return { Attributes: old };
      }
      if (command.constructor.name === 'ScanCommand') {
        return { Items: [...items.values()] };
      }
      return {};
    })
  };
};

const createCassandraClient = () => {
  const rows = new Map<string, any>();
  return {
    execute: jest.fn(async (query: string, params: any[] = []) => {
      if (query.startsWith('CREATE TABLE')) return { rows: [] };
      if (query.startsWith('SELECT id FROM')) {
        const id = params[0];
        return { rows: rows.has(id) ? [{ id }] : [] };
      }
      if (query.startsWith('SELECT payload FROM') && query.includes('WHERE id = ?')) {
        const id = params[0];
        const payload = rows.get(id);
        return { rows: payload ? [{ payload }] : [] };
      }
      if (query.startsWith('SELECT payload FROM')) {
        return { rows: [...rows.values()].map((payload) => ({ payload })) };
      }
      if (query.startsWith('INSERT INTO')) {
        rows.set(params[0], params[1]);
        return { rows: [] };
      }
      if (query.startsWith('UPDATE')) {
        rows.set(params[6], params[0]);
        return { rows: [] };
      }
      if (query.startsWith('DELETE FROM')) {
        rows.delete(params[0]);
        return { rows: [] };
      }
      return { rows: [] };
    })
  };
};

const createFirebaseClient = () => {
  const docs = new Map<string, any>();
  return {
    collection: () => ({
      doc: (id: string) => ({
        get: async () => ({
          exists: docs.has(id),
          data: () => docs.get(id)
        }),
        set: async (value: any) => {
          docs.set(id, value);
        },
        delete: async () => {
          docs.delete(id);
        }
      }),
      get: async () => ({
        docs: [...docs.values()].map((value) => ({
          data: () => value
        }))
      })
    })
  };
};

const createOracleClient = () => {
  const rows = new Map<string, any>();
  return {
    execute: jest.fn(async (query: string, binds: Record<string, any> = {}) => {
      if (query.startsWith('CREATE TABLE')) return {};
      if (query.startsWith('SELECT id FROM')) {
        return { rows: rows.has(binds.id) ? [[binds.id]] : [] };
      }
      if (query.startsWith('INSERT INTO')) {
        rows.set(binds.id, binds.payload);
        return { rowsAffected: 1 };
      }
      if (query.startsWith('UPDATE')) {
        rows.set(binds.id, binds.payload);
        return { rowsAffected: 1 };
      }
      if (query.startsWith('DELETE FROM')) {
        const existed = rows.delete(binds.id);
        return { rowsAffected: existed ? 1 : 0 };
      }
      if (query.startsWith('SELECT payload FROM') && query.includes('WHERE id = :id')) {
        const value = rows.get(binds.id);
        return { rows: value ? [[value]] : [] };
      }
      if (query.startsWith('SELECT payload FROM')) {
        return { rows: [...rows.values()].map((value) => [value]) };
      }
      return { rows: [] };
    })
  };
};

const createOracleClientTableAlreadyExists = () => {
  const rows = new Map<string, any>();
  const execute = jest.fn(async (query: string, binds: Record<string, any> = {}) => {
    if (query.startsWith('CREATE TABLE')) {
      const err: any = new Error('ORA-00955: name is already used by an existing object');
      throw err;
    }
    if (query.startsWith('SELECT payload FROM') && query.includes('WHERE id = :id')) {
      const value = rows.get(binds.id);
      return { rows: value ? [[value]] : [] };
    }
    if (query.startsWith('SELECT payload FROM')) {
      return { rows: [...rows.values()].map((value) => [value]) };
    }
    if (query.startsWith('INSERT INTO')) {
      rows.set(binds.id, binds.payload);
      return { rowsAffected: 1 };
    }
    if (query.startsWith('DELETE FROM')) {
      return { rowsAffected: 0 };
    }
    return { rows: [] };
  });
  return { execute };
};

const createOracleClientCreateTableFailure = () => ({
  execute: jest.fn(async (query: string) => {
    if (query.startsWith('CREATE TABLE')) {
      throw new Error('ORA-00000: unexpected');
    }
    return { rows: [] };
  })
});

const createDynamoClientDescribeFails = () => ({
  send: jest.fn(async (command: any) => {
    const handlers: Record<string, () => any> = {
      DescribeTableCommand: () => {
        throw new Error('boom');
      }
    };
    const handler = handlers[command.constructor.name];
    return handler ? handler() : {};
  })
});

const createOracleObjectRowsConnection = () => ({
  execute: jest.fn(async (query: string) => {
    const handlers: Array<{ match: (q: string) => boolean; result: () => any }> = [
      {
        match: (q) => q.startsWith('CREATE TABLE'),
        result: () => {
          const err: any = new Error('ORA-00955: name is already used by an existing object');
          throw err;
        }
      },
      {
        match: (q) => q.startsWith('SELECT payload FROM USERS'),
        result: () => ({ rows: [{ payload: JSON.stringify({ id: 'u1', username: 'john' }) }, { payload: null }] })
      }
    ];
    const matched = handlers.find((entry) => entry.match(query));
    return matched ? matched.result() : { rows: [] };
  })
});

const modelGetByOptionalKey = (key?: string): any => {
  if (key) return 'u1';
  return { id: 'u1' };
};

const createDynamoMissingTableClient = () => {
  const items = new Map<string, any>();
  const send = jest.fn(async (command: any) => {
    const handlers: Record<string, () => any> = {
      DescribeTableCommand: () => {
        const err: any = new Error('not found');
        err.name = 'ResourceNotFoundException';
        throw err;
      },
      CreateTableCommand: () => ({}),
      GetItemCommand: () => ({ Item: items.get(command.input.Key.id.S) }),
      PutItemCommand: () => {
        items.set(command.input.Item.id.S, command.input.Item);
        return {};
      },
      ScanCommand: () => ({ Items: [...items.values()] }),
      DeleteItemCommand: () => ({ Attributes: undefined })
    };
    const handler = handlers[command.constructor.name];
    return handler ? handler() : {};
  });
  return {
    items,
    client: { send }
  };
};

const createDynamoClientWithNullScanRows = () => ({
  send: jest.fn(async (command: any) => {
    const handlers: Record<string, () => any> = {
      DescribeTableCommand: () => ({}),
      ScanCommand: () => ({
        Items: [
          { id: { S: 'u1' } },
          { payload_json: { S: JSON.stringify({ id: 'u2' }) } }
        ]
      })
    };
    const handler = handlers[command.constructor.name];
    return handler ? handler() : {};
  })
});

describe('external store proxy', () => {
  it('handles mongodb create/read/update/delete/getAll/getByRelation', async () => {
    expect.assertions(4);
    const connector = new FakeConnector(createMongoClient(), 'mongoose-mongo');
    const store = new ExternalStoreProxy<any>('Mongo', 'User', connector);

    await store.create('u1', { id: 'u1', username: 'john', organization: 'org-1' });
    await expect(store.create('u2', {
      id: 'u2',
      username: 'JOHN',
      organization: 'org-2'
    })).rejects.toThrow(ConflictError);

    const one = await store.getOneById('u1');
    expect(one.username).toBe('john');

    await store.update('u1', { firstName: 'John' });

    const byRelation = await store.getByRelation('organization', 'org-1');
    expect(byRelation).toHaveLength(1);

    await expect(store.delete('u1')).resolves.toBe(true);
  });

  it('throws not found for missing mongo record', async () => {
    expect.assertions(1);
    const connector = new FakeConnector(createMongoClient(), 'mongoose-mongo');
    const store = new ExternalStoreProxy<any>('Mongo', 'User', connector);
    await expect(store.getOneById('missing')).rejects.toThrow(DataBaseNotFoundError);
  });

  it('handles sql create/read/update/delete/getAll/getByName', async () => {
    expect.assertions(5);
    const connector = new FakeConnector(createSqlClient(), 'sequelize-postgres');
    const store = new ExternalStoreProxy<any>('PostgreSQL', 'Organization', connector);

    await store.create('o1', { id: 'o1', name: 'Org One', users: [] });
    await expect(store.create('o2', {
      id: 'o2',
      name: 'org one',
      users: []
    })).rejects.toThrow(ConflictError);

    const byName = await store.getByName('Org One');
    expect(byName.id).toBe('o1');

    const updated = await store.update('o1', { users: ['u1'] });
    expect(updated.users).toStrictEqual(['u1']);

    const list = await store.getAll({}, { page: 1, size: 10 });
    expect(list.result).toHaveLength(1);

    await expect(store.delete('o1')).resolves.toBe(true);
  });

  it('throws explicit error for unsupported drivers', async () => {
    expect.assertions(5);
    const connector = new FakeConnector({}, 'aws-dynamodb');
    const store = new ExternalStoreProxy<any>('unsupported' as any, 'User', connector);
    await expect(store.getAll({}, { page: 1, size: 10 })).rejects.toThrow(
      'is not supported by ExternalStoreProxy yet'
    );
    await expect(store.create('u1', { id: 'u1' })).rejects.toThrow('is not supported by ExternalStoreProxy yet');
    await expect(store.update('u1', { id: 'u1' })).rejects.toThrow('is not supported by ExternalStoreProxy yet');
    await expect(store.delete('u1')).rejects.toThrow('is not supported by ExternalStoreProxy yet');
    await expect(store.getOneById('u1')).rejects.toThrow('is not supported by ExternalStoreProxy yet');
  });

  it('handles dynamodb create/read/update/delete/getAll', async () => {
    expect.assertions(4);
    const connector = new FakeConnector(createDynamoClient(), 'aws-dynamodb');
    const store = new ExternalStoreProxy<any>('DynamoDB', 'User', connector);
    await store.create('u1', { id: 'u1', username: 'john' });
    const one = await store.getOneById('u1');
    expect(one.username).toBe('john');
    const updated = await store.update('u1', { firstName: 'John' });
    expect(updated.firstName).toBe('John');
    const list = await store.getAll({}, { page: 1, size: 10 });
    expect(list.total).toBe(1);
    await expect(store.delete('u1')).resolves.toBe(true);
  });

  it('handles cassandra create/read/update/delete/getAll', async () => {
    expect.assertions(4);
    const connector = new FakeConnector(createCassandraClient(), 'cassandra');
    const store = new ExternalStoreProxy<any>('Cassandra', 'User', connector);
    await store.create('u1', { id: 'u1', username: 'john' });
    const one = await store.getOneById('u1');
    expect(one.username).toBe('john');
    const updated = await store.update('u1', { firstName: 'John' });
    expect(updated.firstName).toBe('John');
    const list = await store.getAll({}, { page: 1, size: 10 });
    expect(list.total).toBe(1);
    await expect(store.delete('u1')).resolves.toBe(true);
  });

  it('handles firebase create/read/update/delete/getAll', async () => {
    expect.assertions(4);
    const connector = new FakeConnector(createFirebaseClient(), 'firebase');
    const store = new ExternalStoreProxy<any>('Firebase', 'User', connector);
    await store.create('u1', { id: 'u1', username: 'john' });
    const one = await store.getOneById('u1');
    expect(one.username).toBe('john');
    const updated = await store.update('u1', { firstName: 'John' });
    expect(updated.firstName).toBe('John');
    const list = await store.getAll({}, { page: 1, size: 10 });
    expect(list.total).toBe(1);
    await expect(store.delete('u1')).resolves.toBe(true);
  });

  it('handles oracle create/read/update/delete/getAll', async () => {
    expect.assertions(4);
    const connector = new FakeConnector(createOracleClient(), 'oracle');
    const store = new ExternalStoreProxy<any>('Oracle', 'User', connector);
    await store.create('u1', { id: 'u1', username: 'john' });
    const one = await store.getOneById('u1');
    expect(one.username).toBe('john');
    const updated = await store.update('u1', { firstName: 'John' });
    expect(updated.firstName).toBe('John');
    const list = await store.getAll({}, { page: 1, size: 10 });
    expect(list.total).toBe(1);
    await expect(store.delete('u1')).resolves.toBe(true);
  });

  it('covers common paging and not-found branches', async () => {
    expect.assertions(4);
    const connector = new FakeConnector(createMongoClient(), 'mongoose-mongo');
    const store = new ExternalStoreProxy<any>('Mongo', 'User', connector);
    await store.create('u1', { id: 'u1', username: 'john' });
    await expect(store.getAll({}, { page: 0, size: 10 })).rejects.toThrow('page must be greater than 0');
    await expect(store.getAll({}, { page: 2, size: 1 })).rejects.toThrow(
      'page number must be smaller than the number of total pages'
    );
    await expect(store.getByName('missing')).rejects.toThrow(DataBaseNotFoundError);
    await expect(new ExternalStoreProxy<any>('Mongo', 'NoUniqueEntity', connector).getByName('x'))
      .rejects.toThrow(DataBaseNotFoundError);
  });

  it('covers disconnected client errors for mongo/sql/dynamo', async () => {
    expect.assertions(3);
    await expect(new ExternalStoreProxy<any>('Mongo', 'User', new FakeConnector({}, 'mongo')).getAll({}, { page: 1, size: 1 }))
      .rejects.toThrow('Mongo client is not connected');
    await expect(new ExternalStoreProxy<any>('PostgreSQL', 'User', new FakeConnector({}, 'sequelize')).getAll({}, { page: 1, size: 1 }))
      .rejects.toThrow('SQL client is not connected');
    await expect(new ExternalStoreProxy<any>('DynamoDB', 'User', new FakeConnector({}, 'dynamodb')).getAll({}, { page: 1, size: 1 }))
      .rejects.toThrow('DynamoDB client is not connected');
  });

  it('covers disconnected client errors for cassandra/firebase/oracle', async () => {
    expect.assertions(3);
    await expect(new ExternalStoreProxy<any>('Cassandra', 'User', new FakeConnector({}, 'cassandra')).getAll({}, { page: 1, size: 1 }))
      .rejects.toThrow('Cassandra client is not connected');
    await expect(new ExternalStoreProxy<any>('Firebase', 'User', new FakeConnector({}, 'firebase')).getAll({}, { page: 1, size: 1 }))
      .rejects.toThrow('Firebase client is not connected');
    await expect(new ExternalStoreProxy<any>('Oracle', 'User', new FakeConnector({}, 'oracle')).getAll({}, { page: 1, size: 1 }))
      .rejects.toThrow('Oracle client is not connected');
  });

  it('covers dynamodb ensure table creation and duplicate id branch', async () => {
    expect.assertions(4);
    const { client } = createDynamoMissingTableClient();
    const store = new ExternalStoreProxy<any>('DynamoDB', 'User', new FakeConnector(client, 'dynamodb'));
    await store.create('u1', { id: 'u1', username: 'john' });
    await expect(store.create('u1', { id: 'u1', username: 'john2' })).rejects.toThrow(ConflictError);
    await expect(store.create('u2', { id: 'u2', username: 'JOHN' })).rejects.toThrow(ConflictError);
    const createTableCalls = client.send.mock.calls.filter(([cmd]: any[]) => cmd.constructor.name === 'CreateTableCommand');
    expect(createTableCalls.length).toBeGreaterThan(0);
    await expect(store.delete('missing')).resolves.toBe(false);
  });

  it('covers cassandra and firebase not-found/false-delete branches', async () => {
    expect.assertions(4);
    const cassandraStore = new ExternalStoreProxy<any>('Cassandra', 'User', new FakeConnector(createCassandraClient(), 'cassandra'));
    await expect(cassandraStore.getOneById('missing')).rejects.toThrow(DataBaseNotFoundError);
    await expect(cassandraStore.delete('missing')).resolves.toBe(false);

    const firebaseStore = new ExternalStoreProxy<any>('Firebase', 'User', new FakeConnector(createFirebaseClient(), 'firebase'));
    await expect(firebaseStore.getOneById('missing')).rejects.toThrow(DataBaseNotFoundError);
    await expect(firebaseStore.delete('missing')).resolves.toBe(false);
  });

  it('covers oracle not-found/false-delete branches', async () => {
    expect.assertions(2);
    const oracleStore = new ExternalStoreProxy<any>('Oracle', 'User', new FakeConnector(createOracleClient(), 'oracle'));
    await expect(oracleStore.getOneById('missing')).rejects.toThrow(DataBaseNotFoundError);
    await expect(oracleStore.delete('missing')).resolves.toBe(false);
  });

  it('covers helper parsing branches for payload formats', () => {
    expect.assertions(5);
    const proxyClass = ExternalStoreProxy as any;
    expect(proxyClass.parsePayload(null)).toBeNull();
    expect(proxyClass.parsePayload({ payload: { id: 'u1' } })).toStrictEqual({ id: 'u1' });
    expect(proxyClass.parsePayload({ payload_json: JSON.stringify({ id: 'u2' }) })).toStrictEqual({ id: 'u2' });
    expect(proxyClass.parsePayload({ payload: JSON.stringify({ id: 'u3' }) })).toStrictEqual({ id: 'u3' });
    expect(proxyClass.parsePayload({ id: 'u4' })).toStrictEqual({ id: 'u4' });
  });

  it('covers sql duplicate-id and not-found branches', async () => {
    expect.assertions(3);
    const store = new ExternalStoreProxy<any>('PostgreSQL', 'User', new FakeConnector(createSqlClient(), 'sequelize'));
    await store.create('u1', { id: 'u1', username: 'john' });
    await expect(store.create('u1', { id: 'u1', username: 'john' })).rejects.toThrow(ConflictError);
    await expect(store.update('missing', { username: 'new' })).rejects.toThrow(DataBaseNotFoundError);
    await expect(store.getOneById('missing')).rejects.toThrow(DataBaseNotFoundError);
  });

  it('covers sql raw-row fallback without payload', async () => {
    expect.assertions(1);
    const store = new ExternalStoreProxy<any>('PostgreSQL', 'User', new FakeConnector(createSqlClientWithoutPayload(), 'sequelize'));
    await store.create('u1', { id: 'u1', username: 'john' });
    await expect(store.getOneById('u1')).resolves.toStrictEqual({ id: 'u1', username: 'john' });
  });

  it('covers mongo update not-found and dynamo parse null-item branch', async () => {
    expect.assertions(2);
    const mongoStore = new ExternalStoreProxy<any>(
      'Mongo',
      'User',
      new FakeConnector(createMongoClient(), 'mongo')
    );
    await expect(mongoStore.update('missing', { username: 'john' })).rejects.toThrow(DataBaseNotFoundError);

    const dynamoStore = new ExternalStoreProxy<any>(
      'DynamoDB',
      'User',
      new FakeConnector(createDynamoClientWithNullScanRows(), 'dynamodb')
    );
    await expect(dynamoStore.getAll({}, { page: 1, size: 10 }))
      .resolves.toMatchObject({ total: 1 });
  });

  it('covers unique conflicts for cassandra/firebase/oracle and oracle table-existing branch', async () => {
    expect.assertions(4);
    const cassandraStore = new ExternalStoreProxy<any>(
      'Cassandra',
      'User',
      new FakeConnector(createCassandraClient(), 'cassandra')
    );
    await cassandraStore.create('u1', { id: 'u1', username: 'john' });
    await expect(cassandraStore.create('u2', { id: 'u2', username: 'JOHN' })).rejects.toThrow(ConflictError);

    const firebaseStore = new ExternalStoreProxy<any>(
      'Firebase',
      'User',
      new FakeConnector(createFirebaseClient(), 'firebase')
    );
    await firebaseStore.create('u1', { id: 'u1', username: 'john' });
    await expect(firebaseStore.create('u2', { id: 'u2', username: 'JOHN' })).rejects.toThrow(ConflictError);

    const oracleStore = new ExternalStoreProxy<any>(
      'Oracle',
      'User',
      new FakeConnector(createOracleClient(), 'oracle')
    );
    await oracleStore.create('u1', { id: 'u1', username: 'john' });
    await expect(oracleStore.create('u2', { id: 'u2', username: 'JOHN' })).rejects.toThrow(ConflictError);

    const oracleExistingTable = new ExternalStoreProxy<any>(
      'Oracle',
      'User',
      new FakeConnector(createOracleClientTableAlreadyExists(), 'oracle')
    );
    await expect(oracleExistingTable.getAll({}, { page: 1, size: 10 }))
      .resolves.toMatchObject({ total: 0 });
  });

  it('rethrows oracle table creation errors when they are not ORA-00955', async () => {
    expect.assertions(1);
    const store = new ExternalStoreProxy<any>(
      'Oracle',
      'User',
      new FakeConnector(createOracleClientCreateTableFailure(), 'oracle')
    );
    await expect(store.getAll({}, { page: 1, size: 10 })).rejects.toThrow('ORA-00000: unexpected');
  });

  it('covers internal unique validators conflict branches directly', async () => {
    expect.assertions(4);
    const dynamoStore: any = new ExternalStoreProxy<any>('DynamoDB', 'User', new FakeConnector({}, 'dynamodb'));
    jest.spyOn(dynamoStore, 'dynamoGetAllRaw' as any).mockResolvedValue([{ id: 'u2', username: 'john' }]);
    await expect(dynamoStore.validateDynamoUnique('u1', { username: 'JOHN' })).rejects.toThrow(ConflictError);

    const cassandraStore: any = new ExternalStoreProxy<any>('Cassandra', 'User', new FakeConnector({}, 'cassandra'));
    jest.spyOn(cassandraStore, 'cassandraGetAllRaw' as any).mockResolvedValue([{ id: 'u2', username: 'john' }]);
    await expect(cassandraStore.validateCassandraUnique('u1', { username: 'JOHN' })).rejects.toThrow(ConflictError);

    const firebaseStore: any = new ExternalStoreProxy<any>('Firebase', 'User', new FakeConnector({}, 'firebase'));
    jest.spyOn(firebaseStore, 'firebaseGetAllRaw' as any).mockResolvedValue([{ id: 'u2', username: 'john' }]);
    await expect(firebaseStore.validateFirebaseUnique('u1', { username: 'JOHN' })).rejects.toThrow(ConflictError);

    const oracleStore: any = new ExternalStoreProxy<any>('Oracle', 'User', new FakeConnector({}, 'oracle'));
    jest.spyOn(oracleStore, 'oracleGetAllRaw' as any).mockResolvedValue([{ id: 'u2', username: 'john' }]);
    await expect(oracleStore.validateOracleUnique('u1', { username: 'JOHN' })).rejects.toThrow(ConflictError);
  });

  it('covers dynamo helper branches for null attributes and table ensure fallback', async () => {
    expect.assertions(3);
    const proxyClass: any = ExternalStoreProxy;
    const item = proxyClass.toDynamoItem('u1', { id: 'u1' });
    expect(item.username).toStrictEqual({ NULL: true });
    expect(item.name).toStrictEqual({ NULL: true });

    const failingClient = createDynamoClientDescribeFails();
    const store: any = new ExternalStoreProxy<any>('DynamoDB', 'User', new FakeConnector(failingClient, 'dynamodb'));
    await expect(store.ensureDynamoTable()).rejects.toThrow('boom');
  });

  it('covers oracle and sql branch paths for object rows, cached model and no-unique model lookup', async () => {
    expect.assertions(3);
    const oracleConnection = createOracleObjectRowsConnection();
    const oracleStore = new ExternalStoreProxy<any>('Oracle', 'User', new FakeConnector(oracleConnection, 'oracle'));
    await expect(oracleStore.getAll({}, { page: 1, size: 10 }))
      .resolves.toMatchObject({ total: 1 });

    const model = {
      sync: jest.fn().mockResolvedValue(undefined),
      findByPk: jest.fn().mockResolvedValue({ get: () => ({ id: 'u1', username: 'john' }) }),
      findOne: jest.fn().mockResolvedValue({ get: modelGetByOptionalKey }),
      create: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue([1]),
      destroy: jest.fn().mockResolvedValue(0),
      findAll: jest.fn().mockResolvedValue([{ get: () => ({ id: 'u1', username: 'john' }) }])
    };
    const sequelize = {
      models: { ExternalUser: model },
      define: jest.fn().mockReturnValue(model),
      Sequelize: { DataTypes: {} }
    };
    const sqlStore: any = new ExternalStoreProxy<any>('PostgreSQL', 'User', new FakeConnector(sequelize, 'sequelize'));
    await expect(sqlStore.getSqlModel()).resolves.toBe(model);
    await expect(sqlStore.validateSqlUnique(model, 'u1', { username: 'john' })).resolves.toBeUndefined();
  });
});
