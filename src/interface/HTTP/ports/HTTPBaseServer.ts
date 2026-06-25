import { IHTTPServer } from './IHTTPServer';
import { IbaseHandler } from './IbaseHandler';

export abstract class HTTPBaseServer<T> implements IHTTPServer<T> {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  // constructor() { }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    try {
      (this.application as any)[handlerFactory.method](
        handlerFactory.path,
        handlerFactory.handler
      );
    } catch (error) {
      // console.log(error);
    }
  }

  public abstract application: T;

  public abstract start(): Promise<void>;

  public abstract stop(): Promise<void>;

  public static compile() {}
}
