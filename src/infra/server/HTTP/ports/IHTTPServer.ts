import { IbaseHandler } from './IbaseHandler';

export interface IHTTPServer<T> {
  // _application: HTTPServerTypes;
  endPointRegister (handlerFactory: IbaseHandler): void;
  application: T;
  start(): void;
  stop(): void;
}
