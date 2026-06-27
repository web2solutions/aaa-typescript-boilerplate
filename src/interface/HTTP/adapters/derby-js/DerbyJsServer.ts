/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable class-methods-use-this */
import { createServer, Server } from 'http';
import { _HTTP_PORT_ } from '@src/config/constants';
import { HTTPBaseServer, IbaseHandler } from '@src/interface/HTTP/ports';

let derbyJsServer: HTTPBaseServer<any> | undefined;

class DerbyJsServer extends HTTPBaseServer<any> {
  public readonly application: any;

  private readonly router: any;

  private server: Server | undefined;

  constructor() {
    super();
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const derby = require('derby');
    // eslint-disable-next-line global-require
    const Router = require('find-my-way');

    this.application = derby.createApp('api');
    this.router = Router();
  }

  private createResponseAdapter(response: any): any {
    return {
      status(code: number) {
        response.statusCode = code;
        return this;
      },
      json(payload: any) {
        response.setHeader('content-type', 'application/json; charset=utf-8');
        response.end(JSON.stringify(payload));
        return payload;
      },
      send(payload: any) {
        if (typeof payload === 'object') {
          response.setHeader('content-type', 'application/json; charset=utf-8');
          response.end(JSON.stringify(payload));
          return payload;
        }
        response.end(payload);
        return payload;
      }
    };
  }

  private async readBody(request: any): Promise<any> {
    const method = (request.method || 'GET').toUpperCase();
    if (method === 'GET' || method === 'HEAD') return {};

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      request.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      request.on('end', () => resolve());
      request.on('error', (error: Error) => reject(error));
    });

    if (!chunks.length) return {};
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (!raw) return {};

    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    this.router.on(
      handlerFactory.method.toUpperCase(),
      handlerFactory.path,
      async (request: any, response: any, params: Record<string, any>) => {
        const body = await this.readBody(request);
        const req = {
          ...request,
          params,
          query: request.query || {},
          headers: request.headers || {},
          body
        };
        const res = this.createResponseAdapter(response);
        await handlerFactory.handler(req, res);
      }
    );
  }

  public async start(): Promise<void> {
    this.server = createServer((req, res) => {
      this.router.lookup(req, res);
    });
    await new Promise<void>((resolve) => {
      this.server!.listen(_HTTP_PORT_, resolve);
    });
  }

  public async stop(): Promise<void> {
    if (!this.server) return;
    await new Promise<void>((resolve) => {
      this.server!.close(() => resolve());
    });
  }

  public static compile(): HTTPBaseServer<any> {
    if (!derbyJsServer) {
      derbyJsServer = new DerbyJsServer();
    }
    return derbyJsServer;
  }
}

export { DerbyJsServer };
