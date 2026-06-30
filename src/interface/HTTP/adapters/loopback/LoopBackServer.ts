/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable class-methods-use-this */
import { _HTTP_PORT_ } from '@src/config/constants';
import {
  HTTPBaseServer,
  IbaseHandler,
  IHTTPRequest,
  IHTTPResponse
} from '@src/interface/HTTP/ports';

export type LoopBackRequest = IHTTPRequest;
export type LoopBackResponse = {
  status: (statusCode: number) => LoopBackResponse;
  json: (payload: any) => any;
  send?: (payload: any) => any;
} & IHTTPResponse;

let loopBackServer: HTTPBaseServer<any> | undefined;

class LoopBackServer extends HTTPBaseServer<any> {
  public readonly application: any;

  constructor() {
    super();
    // Lazy require keeps compilation independent from optional framework install.
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { RestApplication } = require('@loopback/rest');
    this.application = new RestApplication({
      rest: { port: _HTTP_PORT_ }
    });
    if (this.application.static) {
      this.application.static('/OASdoc', 'OASdoc');
      this.application.static('/AsyncAPIdoc', 'AsyncAPIdoc');
    }
    if (this.application.get) {
      this.application.get('/docs/asyncapi', (_req: any, res: any) => {
        if (res.redirect) {
          res.redirect('/AsyncAPIdoc');
          return;
        }
        if (res.status && res.json) {
          res.status(302).json({ location: '/AsyncAPIdoc' });
        }
      });
    }
  }

  private createResponseAdapter(response: any): any {
    return {
      status(code: number) {
        if (response.status) response.status(code);
        else if (response.code) response.code(code);
        return this;
      },
      json(payload: any) {
        if (response.json) return response.json(payload);
        if (response.send) return response.send(payload);
        return payload;
      },
      send(payload: any) {
        if (response.send) return response.send(payload);
        if (response.json) return response.json(payload);
        return payload;
      }
    };
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    try {
      const method = handlerFactory.method.toLowerCase();
      (this.application as any)[method](handlerFactory.path, async (req: any, res: any) => {
        return handlerFactory.handler(req, this.createResponseAdapter(res));
      });
    } catch (error) {
      // no-op on registration failure to preserve baseline behavior
    }
  }

  public async start(): Promise<void> {
    await this.application.start();
  }

  public async stop(): Promise<void> {
    if (this.application?.stop) {
      await this.application.stop();
    }
  }

  public static compile(): HTTPBaseServer<any> {
    if (!loopBackServer) {
      loopBackServer = new LoopBackServer();
    }
    return loopBackServer;
  }
}

export { LoopBackServer };
