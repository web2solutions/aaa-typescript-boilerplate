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

export type FeathersRequest = IHTTPRequest;
export type FeathersResponse = {
  status: (statusCode: number) => FeathersResponse;
  json: (payload: any) => any;
  send?: (payload: any) => any;
} & IHTTPResponse;

let feathersServer: HTTPBaseServer<any> | undefined;

class FeathersServer extends HTTPBaseServer<any> {
  public readonly application: any;

  private httpServer: any;

  constructor() {
    super();
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { feathers } = require('@feathersjs/feathers');
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const {
      koa,
      rest,
      bodyParser,
      errorHandler
    } = require('@feathersjs/koa');

    this.application = koa(feathers());
    this.application.use(async (context: any, next: any) => {
      const requestPath = context.path || context.request?.path || '';
      const rootDir = process.cwd();
      const readStatic = (prefix: string, folder: string): boolean => {
        if (!requestPath.startsWith(prefix)) return false;
        const relative = requestPath.replace(`${prefix}/`, '') || 'index.html';
        const absolute = path.join(rootDir, folder, relative);
        if (!fs.existsSync(absolute)) {
          context.status = 404;
          context.body = { message: 'Not found' };
          return true;
        }
        context.status = 200;
        context.body = fs.readFileSync(absolute);
        if (absolute.endsWith('.html')) context.type = 'text/html';
        else if (absolute.endsWith('.js')) context.type = 'application/javascript';
        else if (absolute.endsWith('.css')) context.type = 'text/css';
        else if (absolute.endsWith('.json')) context.type = 'application/json';
        return true;
      };
      if (requestPath === '/docs/asyncapi') {
        context.status = 302;
        context.redirect('/AsyncAPIdoc');
        return;
      }
      if (readStatic('/OASdoc', 'OASdoc')) return;
      if (readStatic('/AsyncAPIdoc', 'AsyncAPIdoc')) return;
      await next();
    });
    this.application.use(bodyParser());
    this.application.configure(rest());
    this.application.use(errorHandler());
  }

  private createResponseAdapter(context: any): any {
    return {
      status(code: number) {
        context.status = code;
        return this;
      },
      json(payload: any) {
        context.body = payload;
        return payload;
      },
      send(payload: any) {
        context.body = payload;
        return payload;
      }
    };
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    const method = handlerFactory.method.toLowerCase();
    (this.application as any)[method](handlerFactory.path, async (context: any) => {
      const req = {
        ...context.request,
        body: context.request.body,
        params: context.params || {},
        query: context.request.query || {},
        headers: context.request.headers || {}
      };
      const res = this.createResponseAdapter(context);
      await handlerFactory.handler(req as any, res as any);
    });
  }

  public async start(): Promise<void> {
    this.httpServer = await this.application.listen(_HTTP_PORT_);
  }

  public async stop(): Promise<void> {
    if (this.httpServer?.close) {
      await Promise.resolve(this.httpServer.close());
    }
  }

  public static compile(): HTTPBaseServer<any> {
    if (!feathersServer) {
      feathersServer = new FeathersServer();
    }
    return feathersServer;
  }
}

export { FeathersServer };
