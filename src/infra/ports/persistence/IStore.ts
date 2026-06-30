import { IPagingRequest, IPagingResponse } from '@src/modules/port';

export type TStorePrimitive = string | number | boolean | Date | null;
export type TStoreScalar = TStorePrimitive | Record<string, unknown>;

export type TFilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'like'
  | 'ilike'
  | 'regex'
  | 'exists'
  | 'contains'
  | 'overlaps'
  | 'between';

export interface IStoreFilterExpression {
  operator: TFilterOperator;
  value?: TStoreScalar | TStoreScalar[];
}

export type TStoreFilterValue =
  | TStoreScalar
  | TStoreScalar[]
  | IStoreFilterExpression
  | Array<IStoreFilterExpression>;

export type TStoreFilters<T> = Partial<Record<Extract<keyof T, string>, TStoreFilterValue>>;

export interface IStoreLogicalFilters<T> {
  and?: Array<TStoreFilters<T>>;
  or?: Array<TStoreFilters<T>>;
  not?: Array<TStoreFilters<T>>;
}

export interface IStoreSortField<T> {
  field: Extract<keyof T, string>;
  direction?: 'asc' | 'desc';
  nulls?: 'first' | 'last';
}

export interface IStoreRelationInclude {
  relation: string;
  fields?: string[];
  required?: boolean;
}

export interface IStoreQuery<T> {
  filters?: TStoreFilters<T>;
  logical?: IStoreLogicalFilters<T>;
  fields?: Array<Extract<keyof T, string>>;
  sort?: Array<IStoreSortField<T>>;
  include?: IStoreRelationInclude[];
  paging?: IPagingRequest;
  cursor?: string;
  limit?: number;
}

export interface IStoreMutationOptions {
  upsert?: boolean;
  returning?: boolean;
  conflictKeys?: string[];
  expectedVersion?: number | string;
  transactionId?: string;
}

export interface IStoreDeleteOptions {
  hardDelete?: boolean;
  transactionId?: string;
}

export interface IStoreBulkWriteItem<T> {
  action: 'create' | 'update' | 'delete' | 'upsert';
  id?: string;
  data?: Partial<T>;
  options?: IStoreMutationOptions | IStoreDeleteOptions;
}

export interface IStoreBulkWriteResult<T> {
  inserted: T[];
  updated: T[];
  deleted: string[];
  errors: Error[];
}

export interface IStoreTransaction {
  id: string;
  provider?: string;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface IStoreIndexDefinition<T> {
  name: string;
  fields: Array<Extract<keyof T, string>>;
  unique?: boolean;
  sparse?: boolean;
  caseInsensitive?: boolean;
}

export type TStoreAggregationStage = Record<string, unknown>;

export interface IStore<T> {
  // Legacy contract used by current modules/repositories.
  delete(id: string): Promise<boolean>;
  getOneById(id: string): Promise<T>;
  getByName?(name: string): Promise<T>;
  getByRelation?(field: keyof T, referenceId: string): Promise<T[]>;
  create(key: string, value: T): Promise<T>;
  update(key: string, value: T): Promise<T>;
  getAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<T[]>>;

  // Expanded contract for relational + non-relational integrations.
  find?(query: IStoreQuery<T>): Promise<IPagingResponse<T[]>>;
  findOne?(query: IStoreQuery<T>): Promise<T | null>;
  count?(query?: IStoreQuery<T>): Promise<number>;
  exists?(query: IStoreQuery<T>): Promise<boolean>;
  createOne?(data: T, options?: IStoreMutationOptions): Promise<T>;
  createMany?(data: T[], options?: IStoreMutationOptions): Promise<T[]>;
  updateOne?(id: string, data: Partial<T>, options?: IStoreMutationOptions): Promise<T>;
  updateMany?(
    query: IStoreQuery<T>,
    data: Partial<T>,
    options?: IStoreMutationOptions
  ): Promise<number>;
  deleteOne?(id: string, options?: IStoreDeleteOptions): Promise<boolean>;
  deleteMany?(query: IStoreQuery<T>, options?: IStoreDeleteOptions): Promise<number>;
  upsertOne?(query: IStoreQuery<T>, data: Partial<T>, options?: IStoreMutationOptions): Promise<T>;
  aggregate?<TResult = unknown>(
    pipeline: TStoreAggregationStage[],
    query?: IStoreQuery<T>
  ): Promise<TResult[]>;
  bulkWrite?(items: IStoreBulkWriteItem<T>[]): Promise<IStoreBulkWriteResult<T>>;
  beginTransaction?(): Promise<IStoreTransaction>;
  ensureIndexes?(indexes: Array<IStoreIndexDefinition<T>>): Promise<void>;
}
