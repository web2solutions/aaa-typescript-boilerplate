/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable class-methods-use-this */
import fs from 'fs';
import path from 'path';
import { _HTTP_PORT_ } from '@src/config/constants';
import {
  HTTPBaseServer,
  IbaseHandler,
  IHTTPRequest,
  IHTTPResponse
} from '@src/interface/HTTP/ports';

export type SailsJsRequest = IHTTPRequest;
export type SailsJsResponse = {
  status: (statusCode: number) => SailsJsResponse;
  json: (payload: any) => any;
  send?: (payload: any) => any;
} & IHTTPResponse;

let sailsJsServer: HTTPBaseServer<any> | undefined;

class SailsJsServer extends HTTPBaseServer<any> {
  public application: any = null;

  private sails: any = null;

  private readonly routes: Record<string, any> = {};

  private registerStaticDocsRoutes(): void {
    const rootDir = process.cwd();
    const register = (prefix: string, folder: string) => {
      this.routes[`GET ${prefix}/*`] = (req: any, res: any) => {
        const rawPath = req.path || req.url || '';
        const relative = rawPath.replace(`${prefix}/`, '') || 'index.html';
        const absolute = path.join(rootDir, folder, relative);
        if (!fs.existsSync(absolute)) {
          if (res.status) res.status(404);
          return res.send ? res.send('Not found') : undefined;
        }
        if (res.type) {
          if (absolute.endsWith('.html')) res.type('text/html');
          else if (absolute.endsWith('.js')) res.type('application/javascript');
          else if (absolute.endsWith('.css')) res.type('text/css');
          else if (absolute.endsWith('.json')) res.type('application/json');
        }
        const content = fs.readFileSync(absolute);
        return res.send ? res.send(content) : content;
      };
    };
    register('/OASdoc', 'OASdoc');
    register('/AsyncAPIdoc', 'AsyncAPIdoc');
    this.routes['GET /docs/asyncapi'] = (_req: any, res: any) => {
      if (res.redirect) return res.redirect('/AsyncAPIdoc');
      if (res.status && res.json) return res.status(302).json({ location: '/AsyncAPIdoc' });
      return undefined;
    };
  }

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
    this.registerStaticDocsRoutes();
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
