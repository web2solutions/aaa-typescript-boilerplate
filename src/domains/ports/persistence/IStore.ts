import { IPagingRequest } from './IPagingRequest';
import { IPagingResponse } from './IPagingResponse';

export interface IStore<T> {
  delete(id: string): Promise<boolean>;
  getOneById(id: string): Promise<T>;
  getByName?(name: string): Promise<T>;
  create(key: string, value: T): Promise<T>;
  update(key: string, value: T): Promise<T>;
  getAll(
    filters: Record<string, string|number>,
    paging: IPagingRequest
  ) : Promise<IPagingResponse<T[]>>;
}
