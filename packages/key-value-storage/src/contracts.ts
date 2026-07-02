export interface IServiceResponse<T = any> {
  result?: T;
  error?: Error | Record<string, any>;
}

export interface IKeyValueStorageClient {
  connected: boolean;
  get(key: string): Promise<IServiceResponse<any>>;
  del(key: string): Promise<IServiceResponse<any>>;
  set(key: string, value: any): Promise<IServiceResponse<any>>;
  connect(): Promise<IServiceResponse<any>>;
  disconnect(): Promise<IServiceResponse<any>>;
}
