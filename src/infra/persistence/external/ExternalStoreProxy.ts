import {
  ConflictError,
  DataBaseNotFoundError,
  DatabasePagingError
} from '@src/infra/exceptions';
import { IStore } from '@src/infra/ports/persistence/IStore';
import { IDbStores } from '@src/infra/persistence/port/IDatabaseClient';
import { BaseExternalDataRepository } from '@src/infra/persistence/external/BaseExternalDataRepository';
import { IPagingRequest, IPagingResponse } from '@src/modules/port';

type TDriverName =
  | 'Mongo'
  | 'PostgreSQL'
  | 'MySQL'
  | 'MSSQL'
  | 'Oracle'
  | 'SQLite'
  | 'DynamoDB'
  | 'Cassandra'
  | 'Firebase'
  | 'Aurora'
  | 'RDS';

type TPrimitive = string | number | boolean | Date | null | undefined;

interface IEntityStoreConfig {
  collectionName: string;
  tableName: string;
  uniqueFields?: string[];
  caseInsensitiveUniqueFields?: string[];
  relationFields?: string[];
}

const ENTITY_CONFIG: Record<string, IEntityStoreConfig> = {
  User: {
    collectionName: 'users',
    tableName: 'users',
    uniqueFields: ['username'],
    caseInsensitiveUniqueFields: ['username'],
    relationFields: ['organization']
  },
  Organization: {
    collectionName: 'organizations',
    tableName: 'organizations',
    uniqueFields: ['name'],
    caseInsensitiveUniqueFields: ['name']
  }
};

const SQL_DRIVERS = new Set<TDriverName>([
  'PostgreSQL',
  'MySQL',
  'MSSQL',
  'SQLite',
  'Aurora',
  'RDS'
]);
const CASSANDRA_DRIVER = 'Cassandra';
const ORACLE_DRIVER = 'Oracle';
const DYNAMODB_DRIVER = 'DynamoDB';
const FIREBASE_DRIVER = 'Firebase';

const normalize = (value: TPrimitive): string => String(value ?? '');

const normalizeCI = (value: TPrimitive): string => normalize(value).toLowerCase();

const applyFilters = (
  records: Record<string, any>[],
  filters: Record<string, string | number>
): Record<string, any>[] => {
  const entries = Object.entries(filters || {});
  if (entries.length === 0) return records;
  return records.filter((record) => entries.every(([key, value]) => record[key] === value));
};

const buildPaging = <T>(
  records: T[],
  paging: IPagingRequest
): IPagingResponse<T[]> => {
  const { page, size } = paging;
  if (page < 1) {
    throw new DatabasePagingError('page must be greater than 0');
  }
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  if (page > totalPages && total > 0) {
    throw new DatabasePagingError('page number must be smaller than the number of total pages');
  }
  const startAt = (page * size) - size;
  const result = records.slice(startAt, startAt + size);
  return {
    result,
    total,
    page,
    size
  };
};

const unsupportedDriverError = (driver: string, entity: string): Error => new Error(
  `[Database:${driver}] Store "${entity}" is not supported by ExternalStoreProxy yet.`
);

export class ExternalStoreProxy<T extends Record<string, any>> implements IStore<T> {
  private readonly driver: TDriverName;

  private readonly entity: string;

  private readonly connector: BaseExternalDataRepository;

  private readonly config: IEntityStoreConfig;

  private sqlModel: any | null = null;

  constructor(
    driver: TDriverName,
    entity: string,
    connector: BaseExternalDataRepository
  ) {
    this.driver = driver;
    this.entity = entity;
    this.connector = connector;
    this.config = ENTITY_CONFIG[entity] || {
      collectionName: entity.toLowerCase(),
      tableName: entity.toLowerCase()
    };
  }

  public async create(key: string, value: T): Promise<T> {
    if (this.driver === 'Mongo') return this.mongoCreate(key, value);
    if (SQL_DRIVERS.has(this.driver)) return this.sqlCreate(key, value);
    if (this.driver === DYNAMODB_DRIVER) return this.dynamoCreate(key, value);
    if (this.driver === CASSANDRA_DRIVER) return this.cassandraCreate(key, value);
    if (this.driver === FIREBASE_DRIVER) return this.firebaseCreate(key, value);
    if (this.driver === ORACLE_DRIVER) return this.oracleCreate(key, value);
    throw unsupportedDriverError(this.driver, this.entity);
  }

  public async update(key: string, value: T): Promise<T> {
    if (this.driver === 'Mongo') return this.mongoUpdate(key, value);
    if (SQL_DRIVERS.has(this.driver)) return this.sqlUpdate(key, value);
    if (this.driver === DYNAMODB_DRIVER) return this.dynamoUpdate(key, value);
    if (this.driver === CASSANDRA_DRIVER) return this.cassandraUpdate(key, value);
    if (this.driver === FIREBASE_DRIVER) return this.firebaseUpdate(key, value);
    if (this.driver === ORACLE_DRIVER) return this.oracleUpdate(key, value);
    throw unsupportedDriverError(this.driver, this.entity);
  }

  public async delete(id: string): Promise<boolean> {
    if (this.driver === 'Mongo') return this.mongoDelete(id);
    if (SQL_DRIVERS.has(this.driver)) return this.sqlDelete(id);
    if (this.driver === DYNAMODB_DRIVER) return this.dynamoDelete(id);
    if (this.driver === CASSANDRA_DRIVER) return this.cassandraDelete(id);
    if (this.driver === FIREBASE_DRIVER) return this.firebaseDelete(id);
    if (this.driver === ORACLE_DRIVER) return this.oracleDelete(id);
    throw unsupportedDriverError(this.driver, this.entity);
  }

  public async getOneById(id: string): Promise<T> {
    if (this.driver === 'Mongo') return this.mongoGetOneById(id);
    if (SQL_DRIVERS.has(this.driver)) return this.sqlGetOneById(id);
    if (this.driver === DYNAMODB_DRIVER) return this.dynamoGetOneById(id);
    if (this.driver === CASSANDRA_DRIVER) return this.cassandraGetOneById(id);
    if (this.driver === FIREBASE_DRIVER) return this.firebaseGetOneById(id);
    if (this.driver === ORACLE_DRIVER) return this.oracleGetOneById(id);
    throw unsupportedDriverError(this.driver, this.entity);
  }

  public async getByName(name: string): Promise<T> {
    const field = this.config.uniqueFields?.[0];
    if (!field) {
      throw new DataBaseNotFoundError('Record not found');
    }
    const page = await this.getAll({ [field]: name }, { page: 1, size: 1 });
    const record = page.result[0];
    if (!record) {
      throw new DataBaseNotFoundError('Record not found');
    }
    return record;
  }

  public async getByRelation(field: keyof T, referenceId: string): Promise<T[]> {
    const result = await this.getAll(
      { [field as string]: referenceId },
      { page: 1, size: 5000 }
    );
    return result.result;
  }

  public async getAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<T[]>> {
    if (this.driver === 'Mongo') return this.mongoGetAll(filters, paging);
    if (SQL_DRIVERS.has(this.driver)) return this.sqlGetAll(filters, paging);
    if (this.driver === DYNAMODB_DRIVER) return this.dynamoGetAll(filters, paging);
    if (this.driver === CASSANDRA_DRIVER) return this.cassandraGetAll(filters, paging);
    if (this.driver === FIREBASE_DRIVER) return this.firebaseGetAll(filters, paging);
    if (this.driver === ORACLE_DRIVER) return this.oracleGetAll(filters, paging);
    throw unsupportedDriverError(this.driver, this.entity);
  }

  private getDynamoTableName(): string {
    return `aaa_${this.config.tableName}`;
  }

  private static parsePayload<TRecord extends Record<string, any>>(
    item: Record<string, any> | undefined | null
  ): TRecord | null {
    if (!item) return null;
    if (item.payload && typeof item.payload === 'object') {
      return item.payload as TRecord;
    }
    if (typeof item.payload_json === 'string') {
      return JSON.parse(item.payload_json) as TRecord;
    }
    if (typeof item.payload === 'string') {
      return JSON.parse(item.payload) as TRecord;
    }
    return item as TRecord;
  }

  private async getDynamoContext(): Promise<{ client: any; sdk: any; tableName: string }> {
    const client = (this.connector as any).getClient?.();
    if (!client || typeof client.send !== 'function') {
      throw new Error(
        `[Database:${this.driver}] DynamoDB client is not connected. Call databaseClient.connect() before accessing stores.`
      );
    }
    const sdk = await import('@aws-sdk/client-dynamodb');
    return {
      client,
      sdk,
      tableName: this.getDynamoTableName()
    };
  }

  private async ensureDynamoTable(): Promise<void> {
    const { client, sdk, tableName } = await this.getDynamoContext();
    try {
      await client.send(new sdk.DescribeTableCommand({ TableName: tableName }));
    } catch (error: any) {
      if (error?.name !== 'ResourceNotFoundException') throw error;
      await client.send(new sdk.CreateTableCommand({
        TableName: tableName,
        BillingMode: 'PAY_PER_REQUEST',
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }]
      }));
    }
  }

  private static toDynamoItem<TRecord extends Record<string, any>>(
    id: string,
    value: TRecord
  ): Record<string, any> {
    return {
      id: { S: id },
      payload_json: { S: JSON.stringify({ ...value, id }) },
      username: value.username ? { S: String(value.username) } : { NULL: true },
      username_ci: value.username ? { S: normalizeCI(value.username) } : { NULL: true },
      name: value.name ? { S: String(value.name) } : { NULL: true },
      name_ci: value.name ? { S: normalizeCI(value.name) } : { NULL: true },
      organization: value.organization ? { S: String(value.organization) } : { NULL: true }
    };
  }

  private static fromDynamoItem<TRecord extends Record<string, any>>(
    item: Record<string, any> | undefined
  ): TRecord | null {
    if (!item) return null;
    if (item.payload_json?.S) {
      return JSON.parse(item.payload_json.S) as TRecord;
    }
    return null;
  }

  private async dynamoGetAllRaw(): Promise<T[]> {
    await this.ensureDynamoTable();
    const { client, sdk, tableName } = await this.getDynamoContext();
    const scanned = await client.send(new sdk.ScanCommand({ TableName: tableName }));
    return (scanned.Items || [])
      .map((item: Record<string, any>) => ExternalStoreProxy.fromDynamoItem<T>(item))
      .filter((item: T | null): item is T => !!item);
  }

  private async validateDynamoUnique(id: string, value: T): Promise<void> {
    const fields = this.config.uniqueFields || [];
    const all = await this.dynamoGetAllRaw();
    await Promise.all(fields.map(async (field) => {
      const ci = (this.config.caseInsensitiveUniqueFields || []).includes(field);
      const recordValue = ci ? normalizeCI(value[field]) : normalize(value[field]);
      const duplicated = all.find((doc: any) => {
        if (doc.id === id) return false;
        const docValue = ci ? normalizeCI(doc[field]) : normalize(doc[field]);
        return docValue === recordValue;
      });
      if (duplicated) {
        throw new ConflictError(`${field} already in use`);
      }
    }));
  }

  private async dynamoCreate(key: string, value: T): Promise<T> {
    await this.ensureDynamoTable();
    await this.validateDynamoUnique(key, value);
    const { client, sdk, tableName } = await this.getDynamoContext();
    const existing = await client.send(new sdk.GetItemCommand({
      TableName: tableName,
      Key: { id: { S: key } }
    }));
    if (existing.Item) throw new ConflictError('Duplicated id');
    await client.send(new sdk.PutItemCommand({
      TableName: tableName,
      Item: ExternalStoreProxy.toDynamoItem(key, value)
    }));
    return value;
  }

  private async dynamoUpdate(key: string, value: T): Promise<T> {
    await this.ensureDynamoTable();
    const { client, sdk, tableName } = await this.getDynamoContext();
    const existing = await client.send(new sdk.GetItemCommand({
      TableName: tableName,
      Key: { id: { S: key } }
    }));
    const current = ExternalStoreProxy.fromDynamoItem<T>(existing.Item);
    if (!current) throw new DataBaseNotFoundError('Record not found');
    const merged = ExternalStoreProxy.mergePayload<T>(current as any, value) as T;
    await this.validateDynamoUnique(key, merged);
    await client.send(new sdk.PutItemCommand({
      TableName: tableName,
      Item: ExternalStoreProxy.toDynamoItem(key, merged)
    }));
    return merged;
  }

  private async dynamoDelete(id: string): Promise<boolean> {
    await this.ensureDynamoTable();
    const { client, sdk, tableName } = await this.getDynamoContext();
    const result = await client.send(new sdk.DeleteItemCommand({
      TableName: tableName,
      Key: { id: { S: id } },
      ReturnValues: 'ALL_OLD'
    }));
    return !!result.Attributes;
  }

  private async dynamoGetOneById(id: string): Promise<T> {
    await this.ensureDynamoTable();
    const { client, sdk, tableName } = await this.getDynamoContext();
    const found = await client.send(new sdk.GetItemCommand({
      TableName: tableName,
      Key: { id: { S: id } }
    }));
    const parsed = ExternalStoreProxy.fromDynamoItem<T>(found.Item);
    if (!parsed) throw new DataBaseNotFoundError('Record not found');
    return parsed;
  }

  private async dynamoGetAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<T[]>> {
    const all = await this.dynamoGetAllRaw();
    const filtered = applyFilters(all as Record<string, any>[], filters) as T[];
    return buildPaging(filtered, paging);
  }

  private async getCassandraClient(): Promise<any> {
    const client = (this.connector as any).getClient?.();
    if (!client || typeof client.execute !== 'function') {
      throw new Error(
        `[Database:${this.driver}] Cassandra client is not connected. Call databaseClient.connect() before accessing stores.`
      );
    }
    return client;
  }

  private getCassandraTableName(): string {
    return this.config.tableName;
  }

  private async ensureCassandraTable(): Promise<void> {
    const client = await this.getCassandraClient();
    await client.execute(
      `CREATE TABLE IF NOT EXISTS ${this.getCassandraTableName()} (
        id text PRIMARY KEY,
        payload text,
        username text,
        username_ci text,
        name text,
        name_ci text,
        organization text
      )`
    );
  }

  private async cassandraGetAllRaw(): Promise<T[]> {
    await this.ensureCassandraTable();
    const client = await this.getCassandraClient();
    const result = await client.execute(`SELECT payload FROM ${this.getCassandraTableName()}`);
    const rows = result.rows || [];
    return rows
      .map((row: any) => (row.payload ? JSON.parse(row.payload) : null))
      .filter((row: T | null): row is T => !!row);
  }

  private async validateCassandraUnique(id: string, value: T): Promise<void> {
    const fields = this.config.uniqueFields || [];
    const all = await this.cassandraGetAllRaw();
    await Promise.all(fields.map(async (field) => {
      const ci = (this.config.caseInsensitiveUniqueFields || []).includes(field);
      const recordValue = ci ? normalizeCI(value[field]) : normalize(value[field]);
      const duplicated = all.find((doc: any) => {
        if (doc.id === id) return false;
        const docValue = ci ? normalizeCI(doc[field]) : normalize(doc[field]);
        return docValue === recordValue;
      });
      if (duplicated) {
        throw new ConflictError(`${field} already in use`);
      }
    }));
  }

  private async cassandraCreate(key: string, value: T): Promise<T> {
    await this.ensureCassandraTable();
    const client = await this.getCassandraClient();
    const existing = await client.execute(
      `SELECT id FROM ${this.getCassandraTableName()} WHERE id = ?`,
      [key],
      { prepare: true }
    );
    if ((existing.rows || []).length > 0) throw new ConflictError('Duplicated id');
    await this.validateCassandraUnique(key, value);
    const payload = ExternalStoreProxy.buildPersistedPayload(key, value);
    await client.execute(
      `INSERT INTO ${this.getCassandraTableName()} (id, payload, username, username_ci, name, name_ci, organization)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        key,
        JSON.stringify(payload.payload),
        payload.username,
        payload.username_ci,
        payload.name,
        payload.name_ci,
        payload.organization
      ],
      { prepare: true }
    );
    return value;
  }

  private async cassandraUpdate(key: string, value: T): Promise<T> {
    const current = await this.cassandraGetOneById(key);
    const merged = ExternalStoreProxy.mergePayload<T>(current as any, value) as T;
    await this.validateCassandraUnique(key, merged);
    const client = await this.getCassandraClient();
    const payload = ExternalStoreProxy.buildPersistedPayload(key, merged);
    await client.execute(
      `UPDATE ${this.getCassandraTableName()}
       SET payload = ?, username = ?, username_ci = ?, name = ?, name_ci = ?, organization = ?
       WHERE id = ?`,
      [
        JSON.stringify(payload.payload),
        payload.username,
        payload.username_ci,
        payload.name,
        payload.name_ci,
        payload.organization,
        key
      ],
      { prepare: true }
    );
    return merged;
  }

  private async cassandraDelete(id: string): Promise<boolean> {
    const exists = await this.cassandraGetAll({}, { page: 1, size: 1 })
      .then(() => this.cassandraGetOneById(id).then(() => true).catch(() => false));
    if (!exists) return false;
    const client = await this.getCassandraClient();
    await client.execute(
      `DELETE FROM ${this.getCassandraTableName()} WHERE id = ?`,
      [id],
      { prepare: true }
    );
    return true;
  }

  private async cassandraGetOneById(id: string): Promise<T> {
    await this.ensureCassandraTable();
    const client = await this.getCassandraClient();
    const found = await client.execute(
      `SELECT payload FROM ${this.getCassandraTableName()} WHERE id = ?`,
      [id],
      { prepare: true }
    );
    const row = found.rows?.[0];
    if (!row) throw new DataBaseNotFoundError('Record not found');
    return JSON.parse(row.payload) as T;
  }

  private async cassandraGetAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<T[]>> {
    const all = await this.cassandraGetAllRaw();
    const filtered = applyFilters(all as Record<string, any>[], filters) as T[];
    return buildPaging(filtered, paging);
  }

  private async getFirebaseCollection(): Promise<any> {
    const firestore = (this.connector as any).getClient?.();
    if (!firestore || typeof firestore.collection !== 'function') {
      throw new Error(
        `[Database:${this.driver}] Firebase client is not connected. Call databaseClient.connect() before accessing stores.`
      );
    }
    return firestore.collection(this.config.collectionName);
  }

  private async firebaseGetAllRaw(): Promise<T[]> {
    const collection = await this.getFirebaseCollection();
    const snapshot = await collection.get();
    const docs = snapshot.docs || [];
    return docs
      .map((doc: any) => ExternalStoreProxy.parsePayload<T>(doc.data()))
      .filter((row: T | null): row is T => !!row);
  }

  private async validateFirebaseUnique(id: string, value: T): Promise<void> {
    const fields = this.config.uniqueFields || [];
    const all = await this.firebaseGetAllRaw();
    await Promise.all(fields.map(async (field) => {
      const ci = (this.config.caseInsensitiveUniqueFields || []).includes(field);
      const recordValue = ci ? normalizeCI(value[field]) : normalize(value[field]);
      const duplicated = all.find((doc: any) => {
        if (doc.id === id) return false;
        const docValue = ci ? normalizeCI(doc[field]) : normalize(doc[field]);
        return docValue === recordValue;
      });
      if (duplicated) throw new ConflictError(`${field} already in use`);
    }));
  }

  private async firebaseCreate(key: string, value: T): Promise<T> {
    const collection = await this.getFirebaseCollection();
    const doc = collection.doc(key);
    const existing = await doc.get();
    if (existing.exists) throw new ConflictError('Duplicated id');
    await this.validateFirebaseUnique(key, value);
    await doc.set(ExternalStoreProxy.buildPersistedPayload(key, value));
    return value;
  }

  private async firebaseUpdate(key: string, value: T): Promise<T> {
    const current = await this.firebaseGetOneById(key);
    const merged = ExternalStoreProxy.mergePayload<T>(current as any, value) as T;
    await this.validateFirebaseUnique(key, merged);
    const collection = await this.getFirebaseCollection();
    await collection.doc(key).set(
      ExternalStoreProxy.buildPersistedPayload(key, merged),
      { merge: true }
    );
    return merged;
  }

  private async firebaseDelete(id: string): Promise<boolean> {
    const collection = await this.getFirebaseCollection();
    const doc = collection.doc(id);
    const existing = await doc.get();
    if (!existing.exists) return false;
    await doc.delete();
    return true;
  }

  private async firebaseGetOneById(id: string): Promise<T> {
    const collection = await this.getFirebaseCollection();
    const doc = await collection.doc(id).get();
    if (!doc.exists) throw new DataBaseNotFoundError('Record not found');
    const parsed = ExternalStoreProxy.parsePayload<T>(doc.data());
    if (!parsed) throw new DataBaseNotFoundError('Record not found');
    return parsed;
  }

  private async firebaseGetAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<T[]>> {
    const all = await this.firebaseGetAllRaw();
    const filtered = applyFilters(all as Record<string, any>[], filters) as T[];
    return buildPaging(filtered, paging);
  }

  private getOracleTableName(): string {
    return this.config.tableName.toUpperCase();
  }

  private async getOracleConnection(): Promise<any> {
    const connection = (this.connector as any).getClient?.();
    if (!connection || typeof connection.execute !== 'function') {
      throw new Error(
        `[Database:${this.driver}] Oracle client is not connected. Call databaseClient.connect() before accessing stores.`
      );
    }
    return connection;
  }

  private async ensureOracleTable(): Promise<void> {
    const connection = await this.getOracleConnection();
    try {
      await connection.execute(
        `CREATE TABLE ${this.getOracleTableName()} (
          id VARCHAR2(128) PRIMARY KEY,
          payload CLOB,
          username VARCHAR2(255),
          username_ci VARCHAR2(255),
          name VARCHAR2(255),
          name_ci VARCHAR2(255),
          organization VARCHAR2(255)
        )`
      );
    } catch (error: any) {
      if (!String(error?.message || '').includes('ORA-00955')) {
        throw error;
      }
    }
  }

  private async oracleGetAllRaw(): Promise<T[]> {
    await this.ensureOracleTable();
    const connection = await this.getOracleConnection();
    const result = await connection.execute(
      `SELECT payload FROM ${this.getOracleTableName()}`
    );
    const rows = result.rows || [];
    return rows
      .map((row: any) => {
        const payload = Array.isArray(row) ? row[0] : row.payload;
        return payload ? JSON.parse(payload) : null;
      })
      .filter((row: T | null): row is T => !!row);
  }

  private async validateOracleUnique(id: string, value: T): Promise<void> {
    const fields = this.config.uniqueFields || [];
    const all = await this.oracleGetAllRaw();
    await Promise.all(fields.map(async (field) => {
      const ci = (this.config.caseInsensitiveUniqueFields || []).includes(field);
      const recordValue = ci ? normalizeCI(value[field]) : normalize(value[field]);
      const duplicated = all.find((doc: any) => {
        if (doc.id === id) return false;
        const docValue = ci ? normalizeCI(doc[field]) : normalize(doc[field]);
        return docValue === recordValue;
      });
      if (duplicated) throw new ConflictError(`${field} already in use`);
    }));
  }

  private async oracleCreate(key: string, value: T): Promise<T> {
    await this.ensureOracleTable();
    const connection = await this.getOracleConnection();
    const existing = await connection.execute(
      `SELECT id FROM ${this.getOracleTableName()} WHERE id = :id`,
      { id: key }
    );
    if ((existing.rows || []).length > 0) throw new ConflictError('Duplicated id');
    await this.validateOracleUnique(key, value);
    const payload = ExternalStoreProxy.buildPersistedPayload(key, value);
    await connection.execute(
      `INSERT INTO ${this.getOracleTableName()}
       (id, payload, username, username_ci, name, name_ci, organization)
       VALUES (:id, :payload, :username, :username_ci, :name, :name_ci, :organization)`,
      {
        id: key,
        payload: JSON.stringify(payload.payload),
        username: payload.username,
        username_ci: payload.username_ci,
        name: payload.name,
        name_ci: payload.name_ci,
        organization: payload.organization
      },
      { autoCommit: true }
    );
    return value;
  }

  private async oracleUpdate(key: string, value: T): Promise<T> {
    const current = await this.oracleGetOneById(key);
    const merged = ExternalStoreProxy.mergePayload<T>(current as any, value) as T;
    await this.validateOracleUnique(key, merged);
    const connection = await this.getOracleConnection();
    const payload = ExternalStoreProxy.buildPersistedPayload(key, merged);
    await connection.execute(
      `UPDATE ${this.getOracleTableName()}
       SET payload = :payload,
           username = :username,
           username_ci = :username_ci,
           name = :name,
           name_ci = :name_ci,
           organization = :organization
       WHERE id = :id`,
      {
        id: key,
        payload: JSON.stringify(payload.payload),
        username: payload.username,
        username_ci: payload.username_ci,
        name: payload.name,
        name_ci: payload.name_ci,
        organization: payload.organization
      },
      { autoCommit: true }
    );
    return merged;
  }

  private async oracleDelete(id: string): Promise<boolean> {
    const connection = await this.getOracleConnection();
    const deleted = await connection.execute(
      `DELETE FROM ${this.getOracleTableName()} WHERE id = :id`,
      { id },
      { autoCommit: true }
    );
    return Number(deleted.rowsAffected || 0) > 0;
  }

  private async oracleGetOneById(id: string): Promise<T> {
    await this.ensureOracleTable();
    const connection = await this.getOracleConnection();
    const result = await connection.execute(
      `SELECT payload FROM ${this.getOracleTableName()} WHERE id = :id`,
      { id }
    );
    const row = result.rows?.[0];
    if (!row) throw new DataBaseNotFoundError('Record not found');
    const payload = Array.isArray(row) ? row[0] : row.payload;
    return JSON.parse(payload) as T;
  }

  private async oracleGetAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<T[]>> {
    const all = await this.oracleGetAllRaw();
    const filtered = applyFilters(all as Record<string, any>[], filters) as T[];
    return buildPaging(filtered, paging);
  }

  private async getMongoCollection(): Promise<any> {
    const connection = (this.connector as any).getClient?.();
    const db = connection?.db;
    if (!db || typeof db.collection !== 'function') {
      throw new Error(
        `[Database:${this.driver}] Mongo client is not connected. Call databaseClient.connect() before accessing stores.`
      );
    }
    return db.collection(this.config.collectionName);
  }

  private async mongoCreate(key: string, value: T): Promise<T> {
    const collection = await this.getMongoCollection();
    await this.validateMongoUnique(key, value);
    const payload = ExternalStoreProxy.buildPersistedPayload(key, value);
    await collection.insertOne(payload);
    return value;
  }

  private async mongoUpdate(key: string, value: T): Promise<T> {
    const collection = await this.getMongoCollection();
    const existing = await collection.findOne({ _id: key });
    if (!existing) {
      throw new DataBaseNotFoundError('Record not found');
    }
    const merged = ExternalStoreProxy.mergePayload<T>(existing.payload || existing, value);
    await this.validateMongoUnique(key, merged as T);
    const nextPayload = ExternalStoreProxy.buildPersistedPayload(key, merged as T);
    await collection.updateOne({ _id: key }, { $set: nextPayload });
    return merged as T;
  }

  private async mongoDelete(id: string): Promise<boolean> {
    const collection = await this.getMongoCollection();
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  private async mongoGetOneById(id: string): Promise<T> {
    const collection = await this.getMongoCollection();
    const found = await collection.findOne({ _id: id });
    if (!found) {
      throw new DataBaseNotFoundError('Record not found');
    }
    return (found.payload || found) as T;
  }

  private async mongoGetAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<T[]>> {
    const collection = await this.getMongoCollection();
    const list = await collection.find({}).toArray();
    const records = list.map((item: any) => (item.payload || item) as T);
    const filtered = applyFilters(records as Record<string, any>[], filters) as T[];
    return buildPaging(filtered, paging);
  }

  private async validateMongoUnique(id: string, value: T): Promise<void> {
    const collection = await this.getMongoCollection();
    const fields = this.config.uniqueFields || [];
    await Promise.all(fields.map(async (field) => {
      const ci = (this.config.caseInsensitiveUniqueFields || []).includes(field);
      const recordValue = ci ? normalizeCI(value[field]) : normalize(value[field]);
      const all = await collection.find({}).toArray();
      const duplicated = all
        .map((item: any) => item.payload || item)
        .find((doc: any) => {
          if (doc.id === id) return false;
          const docValue = ci ? normalizeCI(doc[field]) : normalize(doc[field]);
          return docValue === recordValue;
        });
      if (duplicated) {
        throw new ConflictError(`${field} already in use`);
      }
    }));
  }

  private async getSqlModel(): Promise<any> {
    if (this.sqlModel) return this.sqlModel;
    const sequelize = (this.connector as any).getClient?.();
    if (!sequelize || typeof sequelize.define !== 'function') {
      throw new Error(
        `[Database:${this.driver}] SQL client is not connected. Call databaseClient.connect() before accessing stores.`
      );
    }

    const DataTypes = sequelize.Sequelize?.DataTypes || (await import('sequelize')).DataTypes;
    const modelName = `External${this.entity}`;
    this.sqlModel = sequelize.models?.[modelName] || sequelize.define(
      modelName,
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
          allowNull: false
        },
        payload: {
          type: DataTypes.JSON,
          allowNull: false
        },
        username: {
          type: DataTypes.STRING,
          allowNull: true
        },
        username_ci: {
          type: DataTypes.STRING,
          allowNull: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: true
        },
        name_ci: {
          type: DataTypes.STRING,
          allowNull: true
        },
        organization: {
          type: DataTypes.STRING,
          allowNull: true
        }
      },
      {
        tableName: this.config.tableName,
        timestamps: false
      }
    );

    await this.sqlModel.sync();
    return this.sqlModel;
  }

  private async sqlCreate(key: string, value: T): Promise<T> {
    const model = await this.getSqlModel();
    const existing = await model.findByPk(key);
    if (existing) {
      throw new ConflictError('Duplicated id');
    }
    await this.validateSqlUnique(model, key, value);
    await model.create(ExternalStoreProxy.buildPersistedPayload(key, value));
    return value;
  }

  private async sqlUpdate(key: string, value: T): Promise<T> {
    const model = await this.getSqlModel();
    const existing = await model.findByPk(key);
    if (!existing) {
      throw new DataBaseNotFoundError('Record not found');
    }
    const raw = existing.get({ plain: true });
    const merged = ExternalStoreProxy.mergePayload<T>(raw.payload || raw, value);
    await this.validateSqlUnique(model, key, merged as T);
    await model.update(
      ExternalStoreProxy.buildPersistedPayload(key, merged as T),
      { where: { id: key } }
    );
    return merged as T;
  }

  private async sqlDelete(id: string): Promise<boolean> {
    const model = await this.getSqlModel();
    const deletedCount = await model.destroy({ where: { id } });
    return deletedCount > 0;
  }

  private async sqlGetOneById(id: string): Promise<T> {
    const model = await this.getSqlModel();
    const found = await model.findByPk(id);
    if (!found) {
      throw new DataBaseNotFoundError('Record not found');
    }
    const raw = found.get({ plain: true });
    return (raw.payload || raw) as T;
  }

  private async sqlGetAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<T[]>> {
    const model = await this.getSqlModel();
    const all = await model.findAll();
    const records = all.map((item: any) => {
      const raw = item.get({ plain: true });
      return (raw.payload || raw) as T;
    });
    const filtered = applyFilters(records as Record<string, any>[], filters) as T[];
    return buildPaging(filtered, paging);
  }

  private async validateSqlUnique(model: any, id: string, value: T): Promise<void> {
    const fields = this.config.uniqueFields || [];
    await Promise.all(fields.map(async (field) => {
      const ci = (this.config.caseInsensitiveUniqueFields || []).includes(field);
      const whereKey = ci ? `${field}_ci` : field;
      const whereValue = ci ? normalizeCI(value[field]) : normalize(value[field]);
      const duplicated = await model.findOne({
        where: {
          [whereKey]: whereValue
        }
      });
      if (duplicated && duplicated.get('id') !== id) {
        throw new ConflictError(`${field} already in use`);
      }
    }));
  }

  private static buildPersistedPayload<TRecord extends Record<string, any>>(
    id: string,
    value: TRecord
  ): Record<string, any> {
    const payload = {
      ...value,
      id
    };
    return {
      _id: id,
      id,
      payload,
      username: payload.username,
      username_ci: payload.username ? normalizeCI(payload.username) : null,
      name: payload.name,
      name_ci: payload.name ? normalizeCI(payload.name) : null,
      organization: payload.organization || null
    };
  }

  private static mergePayload<TRecord extends Record<string, any>>(
    previous: Record<string, any>,
    next: Partial<TRecord>
  ): Record<string, any> {
    return {
      ...previous,
      ...next,
      updatedAt: new Date()
    };
  }
}

export const createExternalStores = (
  driver: TDriverName,
  connector: BaseExternalDataRepository
): IDbStores => ({
  User: new ExternalStoreProxy(driver, 'User', connector),
  Organization: new ExternalStoreProxy(driver, 'Organization', connector)
});
