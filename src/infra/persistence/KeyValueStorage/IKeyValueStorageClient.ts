export interface IKeyValueStorageClient {
  get(key: string): any;
  set(key: string, value: any): boolean;
  connect(): void;
  disconnect(): void;
}
