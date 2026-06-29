/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';

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

type RouteMatch = {
  matched: boolean;
  params: Record<string, string>;
};

type RegisteredRoute = {
  method: string;
  path: string;
  handler: IbaseHandler['handler'];
};

type VercelRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | number | undefined>;
  body?: unknown;
};

type VercelResponse = {
  writableEnded?: boolean;
  setHeader: (key: string, value: string) => void;
  status: (statusCode: number) => VercelResponse;
  json: (payload: any) => any;
  send: (payload: any) => any;
  end: () => void;
};

export type VercelFunctionsRequest = IHTTPRequest;
export type VercelFunctionsResponse = {
  status: (statusCode: number) => VercelFunctionsResponse;
  json: (payload: any) => any;
  send?: (payload: any) => any;
} & IHTTPResponse;

class VercelFunctionsServer extends HTTPBaseServer<Record<string, never>> {
  private static instance: any;

  public readonly application: Record<string, never> = {};

  private readonly routes: RegisteredRoute[] = [];

  private static getContentType(fileName: string): string {
    if (fileName.endsWith('.html')) return 'text/html; charset=utf-8';
    if (fileName.endsWith('.js')) return 'application/javascript; charset=utf-8';
    if (fileName.endsWith('.css')) return 'text/css; charset=utf-8';
    if (fileName.endsWith('.json')) return 'application/json; charset=utf-8';
    return 'text/plain; charset=utf-8';
  }

  private static tryServeStaticDoc(pathname: string, res: VercelResponse): boolean {
    const rootDir = process.cwd();
    const resolve = (prefix: string, folder: string): string | undefined => {
      if (!pathname.startsWith(prefix)) return undefined;
      const relative = pathname.replace(`${prefix}/`, '') || 'index.html';
      return path.join(rootDir, folder, relative);
    };
    const absolutePath = resolve('/OASdoc', 'OASdoc') || resolve('/AsyncAPIdoc', 'AsyncAPIdoc');
    if (!absolutePath) return false;
    if (!fs.existsSync(absolutePath)) {
      res.status(404).json({ message: 'Not found' });
      return true;
    }
    res.setHeader('content-type', VercelFunctionsServer.getContentType(absolutePath));
    res.status(200).send(fs.readFileSync(absolutePath));
    return true;
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    this.routes.push({
      method: handlerFactory.method.toUpperCase(),
      path: handlerFactory.path,
      handler: handlerFactory.handler
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async start(): Promise<void> {
    // Vercel Functions runs per request, no process listener.
  }

  // eslint-disable-next-line class-methods-use-this
  public async stop(): Promise<void> {
    // no-op
  }

  private static matchPath(template: string, value: string): RouteMatch {
    const templateParts = template.split('/').filter(Boolean);
    const valueParts = value.split('/').filter(Boolean);
    if (templateParts.length !== valueParts.length) {
      return { matched: false, params: {} };
    }

    const params: Record<string, string> = {};
    for (let i = 0; i < templateParts.length; i += 1) {
      const [templatePart, valuePart] = [templateParts[i], valueParts[i]];

      if (templatePart.startsWith(':')) {
        params[templatePart.slice(1)] = decodeURIComponent(valuePart);
      } else if (templatePart !== valuePart) {
        return { matched: false, params: {} };
      }
    }

    return { matched: true, params };
  }

  private static getUrl(req: VercelRequest): URL {
    const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = (req.headers.host as string) || 'localhost';
    const requestPath = req.url || '/';
    return new URL(`${protocol}://${host}${requestPath}`);
  }

  public async handle(req: VercelRequest, res: VercelResponse): Promise<void> {
    const url = VercelFunctionsServer.getUrl(req);
    const { pathname } = url;
    const method = (req.method || 'GET').toUpperCase();

    if (pathname === '/docs/asyncapi') {
      res.status(302).setHeader('location', '/AsyncAPIdoc');
      res.end();
      return;
    }
    if (VercelFunctionsServer.tryServeStaticDoc(pathname, res)) {
      return;
    }

    const matched = this.routes
      .map((route) => ({ route, match: VercelFunctionsServer.matchPath(route.path, pathname) }))
      .find((candidate) => candidate.route.method === method && candidate.match.matched);

    if (!matched) {
      res.status(404).json({ message: 'Not found' });
      return;
    }

    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) headers[key] = value.join(',');
      else if (typeof value === 'string') headers[key] = value;
      else if (typeof value === 'number') headers[key] = `${value}`;
    });

    const frameworkReq = {
      ...req,
      params: matched.match.params,
      query: Object.fromEntries(url.searchParams.entries()),
      headers,
      body: req.body
    } as unknown as VercelFunctionsRequest;

    const frameworkRes = res as unknown as VercelFunctionsResponse;
    const result = await matched.route.handler(frameworkReq, frameworkRes);

    if (result !== undefined && !res.writableEnded) {
      if (typeof result === 'string') {
        res.status(200).send(result);
      } else {
        res.status(200).json(result);
      }
    }
  }

  public static compile(): VercelFunctionsServer {
    if (!VercelFunctionsServer.instance) {
      VercelFunctionsServer.instance = new VercelFunctionsServer();
    }
    return VercelFunctionsServer.instance;
  }
}

const serverType = EHTTPFrameworks.vercel_functions;
const webServer = VercelFunctionsServer.compile();
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

const API = new RestAPI<Record<string, never>>({
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

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await ensureInitialized();
  await webServer.handle(req, res);
}
