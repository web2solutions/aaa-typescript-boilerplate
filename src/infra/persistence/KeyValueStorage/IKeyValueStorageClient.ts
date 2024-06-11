import { IServiceResponse } from '@src/domains/ports/IServiceResponse';

export interface IKeyValueStorageClient {
  get(key: string): Promise<IServiceResponse<any>>;
  set(key: string, value: any): Promise<IServiceResponse<any>>;
  connect(): void;
  disconnect(): void;
}
