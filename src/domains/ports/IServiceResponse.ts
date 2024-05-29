export interface IServiceResponse<T> {
  // public store: IStore<T>;
  ok?: T;
  error?: Error;
}
