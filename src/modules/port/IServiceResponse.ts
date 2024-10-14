export interface IServiceResponse<T = any> {
  // public store: IStore<T>;
  result?: T;
  page?: number,
  size?: number;
  total?: number;
  error?: Error;
  message?: string;
}
