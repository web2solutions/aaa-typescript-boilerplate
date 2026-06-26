/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable class-methods-use-this */
import { _HTTP_PORT_ } from '@src/config/constants';
import { HTTPBaseServer, IbaseHandler } from '@src/interface/HTTP/ports';

let sailsJsServer: HTTPBaseServer<any> | undefined;

class SailsJsServer extends HTTPBaseServer<any> {
  public application: any = null;

  private sails: any = null;

  private readonly routes: Record<string, any> = {};

  private createResponseAdapter(res: any): any {
    return {
      status(code: number) {
        if (res.status) res.status(code);
        return this;
      },
      json(payload: any) {
        if (res.json) return res.json(payload);
        if (res.send) return res.send(payload);
        return payload;
      },
      send(payload: any) {
        if (res.send) return res.send(payload);
        if (res.json) return res.json(payload);
        return payload;
      }
    };
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    const routeKey = `${handlerFactory.method.toUpperCase()} ${handlerFactory.path}`;
    this.routes[routeKey] = async (req: any, res: any) => {
      return handlerFactory.handler(req, this.createResponseAdapter(res));
    };
  }

  public async start(): Promise<void> {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { Sails } = require('sails');
    this.sails = new Sails();

    await new Promise<void>((resolve, reject) => {
      this.sails.lift(
        {
          hooks: { grunt: false },
          log: { level: 'error' },
          port: _HTTP_PORT_,
          routes: this.routes
        },
        (error: any) => {
          if (error) {
            reject(error);
            return;
          }
          this.application = this.sails;
          resolve();
        }
      );
    });
  }

  public async stop(): Promise<void> {
    if (!this.sails) return;
    await new Promise<void>((resolve, reject) => {
      this.sails.lower((error: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  public static compile(): HTTPBaseServer<any> {
    if (!sailsJsServer) {
      sailsJsServer = new SailsJsServer();
    }
    return sailsJsServer;
  }
}

export { SailsJsServer };
