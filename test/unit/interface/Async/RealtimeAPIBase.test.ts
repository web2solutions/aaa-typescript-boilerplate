/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  IAsyncOperationRequest,
  IRealtimeAPIFactory,
  IRealtimeOperationEntry,
  RealtimeAPIBase
} from '@src/interface/Async/RealtimeAPIBase';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { JwtService } from '@src/infra/jwt/JwtService';
import { composeUsersAuthServices } from '@src/modules/Users';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';

class TestRealtimeAPI extends RealtimeAPIBase {
  public constructor(config: IRealtimeAPIFactory, autoBuild = false) {
    super(config, autoBuild);
  }

  public addOperation(entry: IRealtimeOperationEntry): void {
    this.registerOperation(entry);
  }

  public async run(request: IAsyncOperationRequest) {
    return this.executeOperation(request);
  }
}

describe('realtime api base', () => {
  const databaseClient = {
    connect: jest.fn(),
    disconnect: jest.fn()
  } as any;

  it('executes operation successfully', async () => {
    expect.hasAssertions();
    const controller = {
      create: jest.fn().mockResolvedValue({
        result: { id: '1' }
      })
    };
    const api = new TestRealtimeAPI({ databaseClient });
    api.addOperation({
      version: '1.0.0',
      operationId: 'create',
      moduleName: 'Users',
      endPointConfig: { operationId: 'create' },
      controller,
      controllerMethod: 'create'
    });

    const response = await api.run({
      operationId: 'create',
      input: { username: 'john' }
    });

    expect(response.ok).toBe(true);
    expect(response.result).toStrictEqual({ id: '1' });
  });

  it('returns error when operation is missing', async () => {
    expect.hasAssertions();
    const api = new TestRealtimeAPI({ databaseClient });
    const response = await api.run({
      operationId: 'missing'
    });
    expect(response.ok).toBe(false);
    expect(response.error?.message).toContain('Operation "missing" not found');
  });

  it('returns error when controller method is missing', async () => {
    expect.hasAssertions();
    const api = new TestRealtimeAPI({ databaseClient });
    api.addOperation({
      version: '1.0.0',
      operationId: 'create',
      moduleName: 'Users',
      endPointConfig: { operationId: 'create' },
      controller: {},
      controllerMethod: 'create'
    });
    const response = await api.run({
      operationId: 'create'
    });
    expect(response.ok).toBe(false);
    expect(response.error?.message).toContain('Controller method "create" not found');
  });

  it('returns service error branch', async () => {
    expect.hasAssertions();
    const api = new TestRealtimeAPI({ databaseClient });
    api.addOperation({
      version: '1.0.0',
      operationId: 'create',
      moduleName: 'Users',
      endPointConfig: { operationId: 'create' },
      controller: {
        create: jest.fn().mockResolvedValue({
          error: new Error('service failed')
        })
      },
      controllerMethod: 'create'
    });
    const response = await api.run({
      operationId: 'create'
    });
    expect(response.ok).toBe(false);
    expect(response.error?.message).toBe('service failed');
  });

  it('executes runtime handler branch and resolves versioned operation', async () => {
    expect.hasAssertions();
    const runtimeHandler = jest.fn().mockResolvedValue({
      ok: true,
      operationId: 'login',
      result: { from: 'runtime' }
    });
    const api = new TestRealtimeAPI({ databaseClient });
    api.addOperation({
      version: '1.0.0',
      operationId: 'login',
      moduleName: 'Users',
      endPointConfig: { operationId: 'login' },
      controller: {},
      controllerMethod: 'login',
      runtimeHandler
    });

    const response = await api.run({
      version: '1.0.0',
      operationId: 'login',
      input: { username: 'john' }
    });

    expect(runtimeHandler).toHaveBeenCalledWith(expect.objectContaining({
      version: '1.0.0',
      operationId: 'login'
    }));
    expect(response.ok).toBe(true);
    expect(response.result).toStrictEqual({ from: 'runtime' });
  });

  it('returns default error shape for non-standard thrown error', async () => {
    expect.hasAssertions();
    const api = new TestRealtimeAPI({ databaseClient });
    api.addOperation({
      version: '1.0.0',
      operationId: 'create',
      moduleName: 'Users',
      endPointConfig: { operationId: 'create' },
      controller: {
        create: jest.fn().mockResolvedValue({
          error: {}
        })
      },
      controllerMethod: 'create'
    });

    const response = await api.run({
      operationId: 'create'
    });
    expect(response.ok).toBe(false);
    expect(response.error?.name).toBe('Error');
    expect(response.error?.message).toBe('Unknown error');
  });

  it('covers compose users module required dependency branches', () => {
    expect.hasAssertions();
    const apiMissingPassword = new TestRealtimeAPI({ databaseClient });
    expect(() => (apiMissingPassword as any).composeUsersModule()).toThrow(
      'PasswordCryptoService is required to compose Users module.'
    );

    const apiMissingMutex = new TestRealtimeAPI({
      databaseClient,
      passwordCryptoService: PasswordCryptoService.compile()
    });
    expect(() => (apiMissingMutex as any).composeUsersModule()).toThrow(
      'MutexService is required to compose Users module.'
    );

    const apiMissingAuth = new TestRealtimeAPI({
      databaseClient,
      passwordCryptoService: PasswordCryptoService.compile(),
      mutexService: MutexService.compile(InMemoryKeyValueStorageClient.compile())
    });
    expect(() => (apiMissingAuth as any).composeUsersModule()).toThrow(
      'AuthService with JwtService is required to compose Users module.'
    );
  });

  it('composes users module once and reuses memoized composition', () => {
    expect.hasAssertions();
    const passwordCryptoService = PasswordCryptoService.compile();
    const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
    const mutexService = MutexService.compile(keyValueStorageClient);
    const jwtService = JwtService.compile();
    const { authService } = composeUsersAuthServices({
      databaseClient: InMemoryDbClient,
      passwordCryptoService,
      mutexService,
      jwtService
    });

    const api = new TestRealtimeAPI({
      databaseClient: InMemoryDbClient,
      passwordCryptoService,
      mutexService,
      authService
    });

    const composedOne = (api as any).composeUsersModule();
    const composedTwo = (api as any).composeUsersModule();
    expect(composedOne).toBeDefined();
    expect(composedTwo).toBe(composedOne);
  });

  it('covers controller metadata and controller module resolution branches', () => {
    expect.hasAssertions();
    expect((RealtimeAPIBase as any).resolveControllerMetadata('auth')).toStrictEqual({
      moduleName: 'Users',
      controllerName: 'AuthController'
    });
    expect((RealtimeAPIBase as any).resolveControllerMetadata('organizations')).toStrictEqual({
      moduleName: 'Users',
      controllerName: 'OrganizationController'
    });
    expect((RealtimeAPIBase as any).resolveControllerMetadata('users')).toStrictEqual({
      moduleName: 'Users',
      controllerName: 'UserController'
    });

    const organizationControllerModule = (RealtimeAPIBase as any).getControllerModule('Users', 'OrganizationController');
    expect(organizationControllerModule).toBeDefined();
    expect(() => (RealtimeAPIBase as any).getControllerModule('Missing', 'Controller')).toThrow(
      'Controller Controller not found for module Missing.'
    );
  });

  it('builds operations from OAS spec and lists operation ids', () => {
    expect.hasAssertions();
    const specDir = fs.mkdtempSync(path.join(os.tmpdir(), 'realtime-oas-'));
    const filePath = path.join(specDir, '1.0.0.yml');
    fs.writeFileSync(filePath, `
openapi: 3.1.0
info:
  version: 1.0.0
  title: test
paths:
  /tasks:
    post:
      operationId: create
`, 'utf8');

    const mockControllerFactory = jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({ result: { id: 'new-user' } })
    }));
    const getControllerModuleSpy = jest
      .spyOn(RealtimeAPIBase as any, 'getControllerModule')
      .mockReturnValue(mockControllerFactory);

    const api = new TestRealtimeAPI(
      {
        databaseClient,
        specDir
      },
      true
    );

    const operationIds = (api as any).listOperationIds();
    expect(operationIds).toContain('create');

    getControllerModuleSpy.mockRestore();
    fs.rmSync(specDir, { recursive: true, force: true });
  });

  it('returns undefined runtime handler when interface runtime factory is disabled', () => {
    expect.hasAssertions();
    const apiWithoutInterface = new TestRealtimeAPI({ databaseClient });
    const disabled = (apiWithoutInterface as any).getRuntimeHandlerFactory({
      moduleName: 'Users',
      operationId: 'create',
      controllerMethod: 'create',
      controller: {},
      endPointConfig: {}
    });
    expect(disabled).toBeUndefined();
  });

  it('returns undefined when runtime handler module cannot be resolved', () => {
    expect.hasAssertions();
    const apiWithInterface = new TestRealtimeAPI({
      databaseClient,
      interfaceType: 'websocketapi',
      frameworkName: 'socket-io'
    });
    const missing = (apiWithInterface as any).getRuntimeHandlerFactory({
      moduleName: 'Missing',
      operationId: 'create',
      controllerMethod: 'create',
      controller: {},
      endPointConfig: {}
    });
    expect(missing).toBeUndefined();
  });

  it('uses message mediator as event bus in constructor', () => {
    expect.hasAssertions();
    const messageMediator = { publish: jest.fn(), subscribe: jest.fn() } as any;
    const api = new TestRealtimeAPI({
      databaseClient,
      messageMediator,
      interfaceType: 'websocketapi',
      frameworkName: 'socket-io'
    });

    expect((api as any).eventBus).toBe(messageMediator);
  });

  it('creates runtime handler from framework module and invokes controller through event wrapper', async () => {
    expect.hasAssertions();
    const api = new TestRealtimeAPI({
      databaseClient,
      interfaceType: 'websocketapi',
      frameworkName: 'socket-io'
    });

    const controller = {
      login: jest.fn().mockResolvedValue({ result: { token: 'abc' } })
    };
    const runtimeHandler = (api as any).getRuntimeHandlerFactory({
      moduleName: 'Users',
      operationId: 'login',
      controllerMethod: 'login',
      controller,
      endPointConfig: { operationId: 'login' }
    });

    expect(typeof runtimeHandler).toBe('function');
    const response = await runtimeHandler({
      operationId: 'login',
      input: { username: 'john' }
    });
    expect(controller.login).toHaveBeenCalledWith(expect.any(Object));
    expect(response).toMatchObject({
      ok: true,
      operationId: 'login',
      result: { token: 'abc' },
      metadata: expect.objectContaining({
        channel: 'api:login:response'
      })
    });
  });

  it('covers runtime handler service error and missing framework handler branches', async () => {
    expect.hasAssertions();
    const api = new TestRealtimeAPI({
      databaseClient,
      interfaceType: 'websocketapi',
      frameworkName: 'socket-io'
    });

    const serviceErrorHandler = (api as any).getRuntimeHandlerFactory({
      moduleName: 'Users',
      operationId: 'login',
      controllerMethod: 'login',
      controller: {
        login: jest.fn().mockResolvedValue({ error: new Error('runtime service failed') })
      },
      endPointConfig: { operationId: 'login' }
    });
    await expect(serviceErrorHandler({
      operationId: 'login',
      input: {}
    })).rejects.toThrow('runtime service failed');

    const missingHandler = (api as any).getRuntimeHandlerFactory({
      moduleName: 'Users',
      operationId: 'missing-handler',
      controllerMethod: 'missing-handler',
      controller: {
        'missing-handler': jest.fn().mockResolvedValue({ result: true })
      },
      endPointConfig: { operationId: 'missing-handler' }
    });
    expect(missingHandler).toBeUndefined();
  });

  it('throws when controller module resolution fails for missing controllers', () => {
    expect.hasAssertions();
    expect(() => (RealtimeAPIBase as any).getControllerModule('Users', 'MissingController')).toThrow(
      'Controller MissingController not found for module Users.'
    );
  });

  it('covers controller-not-found fallback after module resolution errors', () => {
    expect.hasAssertions();
    expect(() => (RealtimeAPIBase as any).getControllerModule('Users', 'MissingController')).toThrow(
      'Controller MissingController not found for module Users.'
    );
  });
});
