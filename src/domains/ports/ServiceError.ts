export class ServiceError extends Error {
  // public store: IStore<T>;
  public name: string;

  public stack: string | undefined;

  public message: string;

  constructor(error: Error) {
    super(error.message);
    this.name = error.name;
    this.message = error.message;
    this.stack = error.stack ?? undefined;
  }
}
