/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable class-methods-use-this */
import { createServer, Server } from 'http';
import fs from 'fs';
import path from 'path';
import { _HTTP_PORT_ } from '@src/config/constants';
import {
  HTTPBaseServer,
  IbaseHandler,
  IHTTPRequest,
  IHTTPResponse
} from '@src/interface/HTTP/ports';

export type AdonisJsRequest = IHTTPRequest;
export type AdonisJsResponse = {
  status: (statusCode: number) => AdonisJsResponse;
  json: (payload: any) => any;
  send?: (payload: any) => any;
} & IHTTPResponse;

let adonisJsServer: HTTPBaseServer<any> | undefined;

class AdonisJsServer extends HTTPBaseServer<any> {
  public readonly application: any = {};

  private readonly router: any;

  private server: Server | undefined;

  private static getContentType(fileName: string): string {
    if (fileName.endsWith('.html')) return 'text/html; charset=utf-8';
    if (fileName.endsWith('.js')) return 'application/javascript; charset=utf-8';
    if (fileName.endsWith('.css')) return 'text/css; charset=utf-8';
    if (fileName.endsWith('.json')) return 'application/json; charset=utf-8';
    if (fileName.endsWith('.svg')) return 'image/svg+xml';
    if (fileName.endsWith('.png')) return 'image/png';
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) return 'image/jpeg';
    return 'text/plain; charset=utf-8';
  }

  constructor() {
    super();
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const Router = require('find-my-way');
    this.router = Router();

    // Prime Adonis HTTP package if installed (kept optional for modular usage).
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      this.application.http = require('@adonisjs/http-server');
    } catch (error) {
      this.application.http = null;
    }
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

  private registerStaticDocsRoutes(): void {
    const rootDir = process.cwd();
    const register = (prefix: string, docFolder: string) => {
      this.router.on('GET', `${prefix}/*`, async (request: any, response: any) => {
        const filePath = (request.url || '').replace(`${prefix}/`, '') || 'index.html';
        const absolutePath = path.join(rootDir, docFolder, filePath);
        if (!fs.existsSync(absolutePath)) {
          response.statusCode = 404;
          response.end('Not found');
          return;
        }
        response.statusCode = 200;
        response.setHeader('content-type', AdonisJsServer.getContentType(absolutePath));
        response.end(fs.readFileSync(absolutePath));
      });
    };

    register('/OASdoc', 'OASdoc');
    register('/AsyncAPIdoc', 'AsyncAPIdoc');
    this.router.on('GET', '/docs/asyncapi', async (_request: any, response: any) => {
      response.statusCode = 302;
      response.setHeader('location', '/AsyncAPIdoc');
      response.end();
    });
  }

  public async start(): Promise<void> {
    this.registerStaticDocsRoutes();
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
    if (!adonisJsServer) {
      adonisJsServer = new AdonisJsServer();
    }
    return adonisJsServer;
  }
}

export { AdonisJsServer };
