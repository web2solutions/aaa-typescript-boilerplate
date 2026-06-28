/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs';
import YAML from 'yaml';
import { OpenAPIV3 } from 'openapi-types';

import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
import { IKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/IKeyValueStorageClient';
import { RealtimeDomainEvent } from '@src/interface/Async/RealtimeDomainEvent';
import { IAuthService, composeUsersAuthServices } from '@src/modules/Users';
import { IEventBus, IMessageMediator } from '@src/modules/port';

export interface IAsyncOperationRequest {
  version?: string;
  operationId: string;
  authorization?: string;
  input?: Record<string, any>;
  params?: Record<string, any>;
  queryString?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface IAsyncOperationResponse {
  ok: boolean;
  version?: string;
  operationId: string;
  result?: any;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
  };
}

export interface IRealtimeAPIFactory {
  databaseClient: IDatabaseClient;
  authService?: IAuthService;
  passwordCryptoService?: IPasswordCryptoService;
  keyValueStorageClient?: IKeyValueStorageClient;
  mutexService?: IMutexService;
  eventBus?: IEventBus;
  messageMediator?: IMessageMediator;
  specDir?: string;
  interfaceType?: 'websocketapi' | 'grpcapi';
  frameworkName?: string;
}

export type IRealtimeRuntimeHandler = (
  request: IAsyncOperationRequest
) => Promise<IAsyncOperationResponse>;

export interface IRealtimeOperationEntry {
  version: string;
  operationId: string;
  moduleName: string;
  endPointConfig: Record<string, any>;
  controller: Record<string, any>;
  controllerMethod: string;
  runtimeHandler?: IRealtimeRuntimeHandler;
}

export interface IRealtimeHandlerFactoryDeps {
  operationId: string;
  controllerMethod: string;
  invoke: IRealtimeRuntimeHandler;
}

const OPERATION_TO_CONTROLLER_METHOD: Record<string, string> = {
  deleteOne: 'delete',
  updateUserPassword: 'updatePassword'
};

export abstract class RealtimeAPIBase {
  private readonly oas: Map<string, OpenAPIV3.Document> = new Map();

  protected readonly operations: Map<string, IRealtimeOperationEntry> = new Map();

  protected started = false;

  protected readonly databaseClient: IDatabaseClient;

  protected readonly mutexClient?: IMutexService;

  protected readonly authService?: IAuthService;

  protected readonly passwordCryptoService?: IPasswordCryptoService;

  protected readonly keyValueStorageClient?: IKeyValueStorageClient;

  protected eventBus?: IEventBus;

  protected readonly messageMediator?: IMessageMediator;

  private readonly specDir: string;

  private readonly interfaceType?: 'websocketapi' | 'grpcapi';

  private readonly frameworkName?: string;

  private usersComposition: ReturnType<typeof composeUsersAuthServices> | undefined;

  constructor(config: IRealtimeAPIFactory, autoBuild = true) {
    this.databaseClient = config.databaseClient;
    this.mutexClient = config.mutexService;
    this.authService = config.authService;
    this.passwordCryptoService = config.passwordCryptoService;
    this.keyValueStorageClient = config.keyValueStorageClient;
    this.eventBus = config.eventBus;
    this.messageMediator = config.messageMediator;
    if (config.messageMediator) {
      this.eventBus = config.messageMediator;
    }
    this.specDir = config.specDir || './spec';
    this.interfaceType = config.interfaceType;
    this.frameworkName = config.frameworkName;

    if (autoBuild) {
      this.buildOperationsFromOAS();
    }
  }

  protected composeUsersModule(): ReturnType<typeof composeUsersAuthServices> {
    if (this.usersComposition) return this.usersComposition;
    if (!this.passwordCryptoService) {
      throw new Error('PasswordCryptoService is required to compose Users module.');
    }
    if (!this.mutexClient) {
      throw new Error('MutexService is required to compose Users module.');
    }
    if (!this.authService?.jwtService) {
      throw new Error('AuthService with JwtService is required to compose Users module.');
    }

    this.usersComposition = composeUsersAuthServices({
      databaseClient: this.databaseClient,
      passwordCryptoService: this.passwordCryptoService,
      mutexService: this.mutexClient,
      jwtService: this.authService.jwtService,
      keyValueStorageClient: this.keyValueStorageClient,
      eventBus: this.eventBus,
      messageMediator: this.messageMediator
    });

    return this.usersComposition;
  }

  protected async executeOperation(
    request: IAsyncOperationRequest
  ): Promise<IAsyncOperationResponse> {
    try {
      const { operationId, version } = request;
      const entry = this.resolveOperation(operationId, version);
      if (!entry) {
        throw new Error(`Operation "${operationId}" not found.`);
      }

      const { controllerMethod, controller } = entry;
      if (entry.runtimeHandler) {
        return entry.runtimeHandler(request);
      }

      const method = controller?.[controllerMethod];
      if (typeof method !== 'function') {
        throw new Error(
          `Controller method "${controllerMethod}" not found for operation "${operationId}".`
        );
      }

      const event = new RealtimeDomainEvent({
        authorization: request.authorization || '',
        input: request.input || {},
        params: request.params || {},
        queryString: request.queryString || {},
        schemaOAS: entry.endPointConfig,
        entity: entry.moduleName,
        action: controllerMethod,
        metadata: request.metadata
      } as any);

      const serviceResponse = await method.call(controller, event);
      if (serviceResponse?.error) {
        throw serviceResponse.error;
      }

      return {
        ok: true,
        version: entry.version,
        operationId,
        metadata: request.metadata || {},
        result: serviceResponse?.result
      };
    } catch (error: any) {
      return {
        ok: false,
        version: request.version,
        operationId: request.operationId,
        metadata: request.metadata || {},
        error: {
          name: error?.name || 'Error',
          message: error?.message || 'Unknown error'
        }
      };
    }
  }

  protected registerOperation(entry: IRealtimeOperationEntry): void {
    const key = `${entry.version}:${entry.operationId}`;
    this.operations.set(key, entry);
  }

  protected listOperationIds(): string[] {
    const set = new Set<string>();
    for (const entry of this.operations.values()) {
      set.add(entry.operationId);
    }
    return [...set];
  }

  private resolveOperation(
    operationId: string,
    version?: string
  ): IRealtimeOperationEntry | undefined {
    if (version) {
      return this.operations.get(`${version}:${operationId}`);
    }

    for (const [key, entry] of this.operations) {
      if (key.endsWith(`:${operationId}`)) {
        return entry;
      }
    }
    return undefined;
  }

  private buildOperationsFromOAS(): void {
    const specs = fs.readdirSync(this.specDir)
      .filter((fileName) => fileName.endsWith('.yml') || fileName.endsWith('.yaml'));

    for (const fileName of specs) {
      const file = fs.readFileSync(`${this.specDir}/${fileName}`, 'utf8');
      const parsed = YAML.parse(file);
      if (parsed?.openapi && parsed?.info?.version && parsed?.paths) {
        this.oas.set(parsed.info.version, parsed);
      }
    }

    for (const [version, spec] of this.oas) {
      for (const path of Object.keys(spec.paths || {})) {
        const operationConfigByMethod: Record<string, any> = spec.paths[path] ?? {};
        for (const method of Object.keys(operationConfigByMethod)) {
          const endPointConfig = operationConfigByMethod[method] as Record<string, any>;
          if (endPointConfig?.operationId) {
            const module = path.split('/')[1];
            const {
              moduleName,
              controllerName
            } = RealtimeAPIBase.resolveControllerMetadata(module);
            const ControllerModule = RealtimeAPIBase.getControllerModule(
              moduleName,
              controllerName
            );
            const usersModuleComposition = moduleName === 'Users' ? this.composeUsersModule() : undefined;

            const controller = new ControllerModule({
              authService: usersModuleComposition?.authService ?? this.authService,
              openApiSpecification: spec,
              databaseClient: this.databaseClient,
              userService: usersModuleComposition?.userService,
              userUseCases: usersModuleComposition?.userUseCases,
              organizationUseCases: usersModuleComposition?.organizationUseCases,
              authUseCases: usersModuleComposition?.authUseCases,
              mutexService: this.mutexClient,
              passwordCryptoService: this.passwordCryptoService,
              messageMediator: this.messageMediator
            });

            const operationId = endPointConfig.operationId as string;
            const controllerMethod = OPERATION_TO_CONTROLLER_METHOD[operationId]
              || operationId;
            const runtimeHandler = this.getRuntimeHandlerFactory({
              moduleName,
              operationId,
              controllerMethod,
              controller,
              endPointConfig
            });
            this.registerOperation({
              version,
              operationId,
              moduleName,
              endPointConfig,
              controller,
              controllerMethod,
              runtimeHandler
            });
          }
        }
      }
    }
  }

  private getRuntimeHandlerFactory({
    moduleName,
    operationId,
    controllerMethod,
    controller,
    endPointConfig
  }: {
    moduleName: string;
    operationId: string;
    controllerMethod: string;
    controller: Record<string, any>;
    endPointConfig: Record<string, any>;
  }): IRealtimeRuntimeHandler | undefined {
    if (!this.interfaceType || !this.frameworkName) return undefined;
    const handlerPath = `@src/modules/${moduleName}/interface/${this.interfaceType}/frameworks/${this.frameworkName}/handlers/${operationId}`;
    try {
      const handlerModule = require(handlerPath);
      if (typeof handlerModule?.default !== 'function') return undefined;
      return handlerModule.default({
        operationId,
        controllerMethod,
        invoke: async (request: IAsyncOperationRequest): Promise<IAsyncOperationResponse> => {
          const event = new RealtimeDomainEvent({
            authorization: request.authorization || '',
            input: request.input || {},
            params: request.params || {},
            queryString: request.queryString || {},
            schemaOAS: endPointConfig,
            entity: moduleName,
            action: controllerMethod,
            metadata: request.metadata
          } as any);

          const serviceResponse = await controller[controllerMethod](event);
          if (serviceResponse?.error) {
            throw serviceResponse.error;
          }
          return {
            ok: true,
            operationId,
            metadata: request.metadata || {},
            result: serviceResponse?.result
          };
        }
      } as IRealtimeHandlerFactoryDeps);
    } catch (error: any) {
      const message = String(error?.message || '');
      if (error?.code !== 'MODULE_NOT_FOUND' && !message.includes('Could not locate module')) {
        throw error;
      }
    }
    return undefined;
  }

  private static resolveControllerMetadata(
    module: string
  ): { moduleName: string; controllerName: string } {
    if (module === 'auth') {
      return { moduleName: 'Users', controllerName: 'AuthController' };
    }
    if (module === 'organizations') {
      return { moduleName: 'Users', controllerName: 'OrganizationController' };
    }
    const moduleName = `${module.charAt(0).toUpperCase()}${module.substring(1, module.length)}`;
    const singular = module.substring(1, module.length - 1);
    const controllerName = `${module.charAt(0).toUpperCase()}${singular}Controller`;
    return { moduleName, controllerName };
  }

  private static getControllerModule(moduleName: string, controllerName: string): any {
    const controllerPath = `@src/modules/${moduleName}/adapters/in/http/controllers/${controllerName}`;
    try {
      const controllerModule = require(controllerPath)[controllerName];
      if (controllerModule) return controllerModule;
    } catch (error: any) {
      const message = String(error?.message || '');
      if (error?.code !== 'MODULE_NOT_FOUND' && !message.includes('Could not locate module')) {
        throw error;
      }
    }

    throw new Error(
      `Controller ${controllerName} not found for module ${moduleName}.`
    );
  }
}
