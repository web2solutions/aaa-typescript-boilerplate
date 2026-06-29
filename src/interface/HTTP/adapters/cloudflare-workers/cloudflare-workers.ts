/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hono } from 'hono';
import type { Context } from 'hono';
import fs from 'fs';
import path from 'path';

import { RestAPI } from '@src/interface/HTTP/RestAPI';
import {
  EHTTPFrameworks,
  HTTPBaseServer,
  IHTTPRequest,
  IHTTPResponse,
  IbaseHandler
} from '@src/interface/HTTP/ports';
import { infraHandlers } from '@src/interface/HTTP/adapters/express/handlers/infraHandlers';
import { compileMessageMediator } from '@src/infra/messages/compileMessageMediator';
import { compileDatabaseClient } from '@src/infra/persistence/compileDatabaseClient';
import { compileKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/compileKeyValueStorageClient';
import { JwtService } from '@src/infra/jwt/JwtService';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { composeUsersAuthServices } from '@src/modules/Users';

type HonoRouteMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

export type CloudflareWorkersRequest = IHTTPRequest;
export type CloudflareWorkersResponse = {
  status: (statusCode: number) => CloudflareWorkersResponse;
  json: (payload: any) => any;
  send?: (payload: any) => any;
} & IHTTPResponse;

class CloudflareWorkersServer extends HTTPBaseServer<Hono> {
  private static instance: any;

  public readonly application: Hono;

  constructor() {
    super();
    this.application = new Hono();
    this.registerStaticDocsRoutes();
  }

  private registerStaticDocsRoutes(): void {
    const rootDir = process.cwd();
    const getType = (fileName: string): string => {
      if (fileName.endsWith('.html')) return 'text/html; charset=utf-8';
      if (fileName.endsWith('.js')) return 'application/javascript; charset=utf-8';
      if (fileName.endsWith('.css')) return 'text/css; charset=utf-8';
      if (fileName.endsWith('.json')) return 'application/json; charset=utf-8';
      return 'text/plain; charset=utf-8';
    };
    const register = (prefix: string, folder: string) => {
      this.application.get(`${prefix}/*`, async (c: Context) => {
        const relative = c.req.path.replace(`${prefix}/`, '') || 'index.html';
        const absolute = path.join(rootDir, folder, relative);
        if (!fs.existsSync(absolute)) {
          return c.json({ message: 'Not found' }, 404);
        }
        const content = fs.readFileSync(absolute);
        return c.newResponse(content, 200, {
          'content-type': getType(absolute)
        });
      });
    };
    register('/OASdoc', 'OASdoc');
    register('/AsyncAPIdoc', 'AsyncAPIdoc');
    this.application.get('/docs/asyncapi', async (c: Context) => {
      return c.redirect('/AsyncAPIdoc', 302);
    });
  }

  private static normalizeBody(raw: string): any {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  private static async parseBody(c: Context): Promise<any> {
    const method = c.req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD') {
      return {};
    }
    const raw = await c.req.text();
    return CloudflareWorkersServer.normalizeBody(raw);
  }

  private static buildRequest(
    c: Context,
    params: Record<string, string>,
    body: any
  ): CloudflareWorkersRequest {
    const headers = Object.fromEntries(c.req.raw.headers.entries());
    return {
      params,
      query: c.req.query(),
      headers,
      body,
      method: c.req.method,
      url: c.req.url
    } as unknown as CloudflareWorkersRequest;
  }

  private static createResponseAdapter(c: Context) {
    const state = {
      statusCode: 200,
      body: undefined as any,
      contentType: 'application/json; charset=utf-8',
      sent: false
    };

    const response: CloudflareWorkersResponse = {
      status(code: number) {
        state.statusCode = code;
        return response;
      },
      json(payload: any) {
        state.body = JSON.stringify(payload);
        state.contentType = 'application/json; charset=utf-8';
        state.sent = true;
        return payload;
      },
      send(payload: any) {
        if (typeof payload === 'string') {
          state.body = payload;
          state.contentType = 'text/plain; charset=utf-8';
        } else {
          state.body = JSON.stringify(payload);
          state.contentType = 'application/json; charset=utf-8';
        }
        state.sent = true;
        return payload;
      }
    } as CloudflareWorkersResponse;

    const finalize = (handlerResult: any): Response => {
      if (handlerResult instanceof Response) return handlerResult;

      if (state.sent) {
        return c.newResponse(state.body, state.statusCode as any, {
          'content-type': state.contentType
        });
      }

      if (handlerResult !== undefined) {
        if (typeof handlerResult === 'string') {
          return c.newResponse(handlerResult, state.statusCode as any, {
            'content-type': 'text/plain; charset=utf-8'
          });
        }
        return c.json(handlerResult, state.statusCode as any);
      }

      return c.newResponse(null, 204);
    };

    return { response, finalize };
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    const method = handlerFactory.method.toLowerCase() as HonoRouteMethod;
    (this.application as any)[method](handlerFactory.path, async (c: Context) => {
      const params = c.req.param();
      const body = await CloudflareWorkersServer.parseBody(c);
      const req = CloudflareWorkersServer.buildRequest(c, params, body);
      const { response, finalize } = CloudflareWorkersServer.createResponseAdapter(c);
      const result = await handlerFactory.handler(req, response);
      return finalize(result);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async start(): Promise<void> {
    // Cloudflare Workers is request-driven.
  }

  // eslint-disable-next-line class-methods-use-this
  public async stop(): Promise<void> {
    // no-op
  }

  public static compile(): CloudflareWorkersServer {
    if (!CloudflareWorkersServer.instance) {
      CloudflareWorkersServer.instance = new CloudflareWorkersServer();
    }
    return CloudflareWorkersServer.instance;
  }
}

const serverType = EHTTPFrameworks.cloudflare_workers;
const webServer = CloudflareWorkersServer.compile();
const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = compileKeyValueStorageClient(process.env.AAA_KEYVALUESTORAGE_DRIVER);
const mutexService = MutexService.compile(keyValueStorageClient);
const messageMediator = compileMessageMediator();
const databaseClient = compileDatabaseClient();

const { authService } = composeUsersAuthServices({
  databaseClient,
  passwordCryptoService,
  mutexService,
  jwtService,
  keyValueStorageClient,
  messageMediator
});

const API = new RestAPI<Hono>({
  databaseClient,
  webServer,
  infraHandlers,
  serverType,
  authService,
  passwordCryptoService,
  keyValueStorageClient,
  mutexService,
  eventBus: messageMediator,
  messageMediator
});

let initialized: Promise<void> | undefined;

const ensureInitialized = async (): Promise<void> => {
  if (!initialized) {
    initialized = (async () => {
      await API.start();
      await API.seedData();
    })();
  }
  await initialized;
};

export const fetch = async (
  request: Request,
  env?: Record<string, any>,
  executionCtx?: any
): Promise<Response> => {
  await ensureInitialized();
  return webServer.application.fetch(request, env, executionCtx);
};

export default {
  fetch
};
