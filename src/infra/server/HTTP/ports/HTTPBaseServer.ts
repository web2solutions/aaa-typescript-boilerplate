import { IHTTPServer } from './IHTTPServer';
import { IbaseHandler } from './IbaseHandler';

export abstract class HTTPBaseServer<T> implements IHTTPServer<T> {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor() { }
  // _application: HTTPServerTypes;

  public abstract endPointRegister (handlerFactory: IbaseHandler): void;

  public abstract application: T;

  public abstract start(): void;

  public abstract stop(): void;
}
