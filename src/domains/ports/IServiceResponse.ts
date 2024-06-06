export interface IServiceResponse<T> {
  // public store: IStore<T>;
  result?: T;
  page?: number,
  size?: number;
  total?: number;
  error?: Error;
}
