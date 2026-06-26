/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs';
import YAML from 'yaml';
import { OpenAPIV3 } from 'openapi-types';

import { _API_PREFIX_, _DOCS_PREFIX_ } from '@src/config/constants';
import { replaceVars } from '@src/shared/utils';
import { IAPIFactory, EHTTPFrameworks, HTTPBaseServer } from '@src/interface/HTTP/ports';

import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
import { IKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/IKeyValueStorageClient';
import { IEventBus, IMessageMediator } from '@src/modules/port';

import {
  IUser,
  IAuthService,
  composeUsersAuthServices
} from '@src/modules/Users';

import users from '@seed/users';

export class RestAPI<T> {
  private readonly oas: Map<string, OpenAPIV3.Document> = new Map();

  private started: boolean = false;

  public readonly server: HTTPBaseServer<T>;

  private readonly serverType: EHTTPFrameworks;

  public readonly databaseClient: IDatabaseClient;

  public readonly mutexClient: IMutexService | undefined;

  private readonly authService: IAuthService | undefined;

  private readonly passwordCryptoService: IPasswordCryptoService | undefined;

  private readonly keyValueStorageClient: IKeyValueStorageClient | undefined;

  private readonly eventBus: IEventBus | undefined;

  private readonly messageMediator: IMessageMediator | undefined;

  private usersComposition: ReturnType<typeof composeUsersAuthServices> | undefined;

  constructor(config: IAPIFactory<T>) {
    this.serverType = config.serverType ?? EHTTPFrameworks.express;
    this.server = config.webServer;

    this.databaseClient = config.databaseClient;

    if (config.keyValueStorageClient) {
      this.keyValueStorageClient = config.keyValueStorageClient;
    }

    if (config.mutexService) {
      this.mutexClient = config.mutexService;
    }

    if (config.authService) {
      this.authService = config.authService;
      // this.authService?.start();
    }

    if (config.passwordCryptoService) {
      this.passwordCryptoService = config.passwordCryptoService;
    }

    if (config.eventBus) {
      this.eventBus = config.eventBus;
    }

    if (config.messageMediator) {
      this.messageMediator = config.messageMediator;
      this.eventBus = config.messageMediator;
    }

    this.buildWithOAS();
    this.buildInfraEndPoints(config);

    process.on('exit', () => {
      this.stop();
    });

    process.on('unhandledRejection', (e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    });
  }

  private buildInfraEndPoints(config: IAPIFactory<T>): void {
    const noServiceInjection = {
      databaseClient: {} as IDatabaseClient,
      spec: {} as OpenAPIV3.Document,
      endPointConfig: {}
    };

    const localhostGet = config.infraHandlers.localhostGetHandlerFactory({ ...noServiceInjection });
    this.server.endPointRegister(localhostGet);

    // serve API docs as JSON
    const apiVersionsGet = config.infraHandlers.apiVersionsGetHandlerFactory({
      ...noServiceInjection,
      apiDocs: this.oas,
      authService: this.authService || ({} as IAuthService)

    });
    this.server.endPointRegister(apiVersionsGet);

    for (const [version, spec] of this.oas) {
      this.server.endPointRegister({
        ...config.infraHandlers.apiDocGetHandlerFactory({
          spec,
          version,
          databaseClient: {} as IDatabaseClient,
          endPointConfig: {}
        }),
        path: `${_DOCS_PREFIX_}/${version}`
      });
    }
  }

  private buildWithOAS(): void {
    // console.time('Load spec files');
    const specs = fs.readdirSync('./spec');
    for (const version of specs) {
      const file = fs.readFileSync(`./spec/${version}`, 'utf8');
      const jsonOAS: OpenAPIV3.Document = YAML.parse(file);
      this.oas.set(jsonOAS.info.version, jsonOAS);
    }
    this.buildEndPoints();
    // console.timeEnd('Load spec files');
  }

  private buildEndPoints(): void {
    for (const [version, spec] of this.oas) {
      this.registerSpecVersionEndpoints(version, spec);
    }
  }

  private registerSpecVersionEndpoints(version: string, spec: OpenAPIV3.Document): void {
    for (const path of Object.keys(spec.paths)) {
      const endPointConfigs: Record<string, any> = spec.paths[path] ?? {};
      for (const method of Object.keys(endPointConfigs)) {
        this.registerOperationEndpoint(version, spec, path, endPointConfigs[method]);
      }
    }
  }

  private registerOperationEndpoint(
    version: string,
    spec: OpenAPIV3.Document,
    path: string,
    endPointConfig: Record<string, any>
  ): void {
    const module = path.split('/')[1];
    const { moduleName, controllerName } = RestAPI.resolveControllerMetadata(module);
    const ControllerModule = RestAPI.getControllerModule(moduleName, controllerName);
    const usersModuleComposition = moduleName === 'Users' ? this.composeUsersModule() : undefined;

    const controller = new ControllerModule({
      authService: usersModuleComposition?.authService ?? this.authService,
      openApiSpecification: spec,
      databaseClient: this.databaseClient,
      userService: usersModuleComposition?.userService,
      userUseCases: usersModuleComposition?.userUseCases,
      authUseCases: usersModuleComposition?.authUseCases,
      mutexService: this.mutexClient,
      passwordCryptoService: this.passwordCryptoService,
      messageMediator: this.messageMediator
    });

    const handlerPath = `@src/modules/${moduleName}/interface/api/frameworks/${this.serverType}/handlers/${endPointConfig.operationId}`;
    const handlerFactory = require(handlerPath).default({
      databaseClient: this.databaseClient,
      mutexService: this.mutexClient,
      endPointConfig,
      spec,
      authService: this.authService,
      controller
    });

    this.server.endPointRegister({
      ...handlerFactory,
      path: `${_API_PREFIX_}/${version}${replaceVars(handlerFactory.path)}`
    });
  }

  private static resolveControllerMetadata(
    module: string
  ): { moduleName: string; controllerName: string } {
    if (module === 'auth') {
      return { moduleName: 'Users', controllerName: 'AuthController' };
    }
    const moduleName = `${module.charAt(0).toUpperCase()}${module.substring(1, module.length)}`;
    const controllerName = `${module.charAt(0).toUpperCase()}${module.substring(1, module.length - 1)}Controller`;
    return { moduleName, controllerName };
  }

  private static getControllerModule(moduleName: string, controllerName: string): any {
    const controllerPaths = [
      `@src/modules/${moduleName}/adapters/in/http/controllers/${controllerName}`,
      `@src/modules/${moduleName}/interface/controller/${controllerName}`
    ];
    for (const controllerPath of controllerPaths) {
      try {
        const controllerModule = require(controllerPath)[controllerName];
        if (controllerModule) {
          return controllerModule;
        }
      } catch (error: any) {
        if (error?.code !== 'MODULE_NOT_FOUND') {
          throw error;
        }
      }
    }

    throw new Error(`Controller ${controllerName} not found for module ${moduleName}.`);
  }

  public async start(): Promise<void> {
    if (this.started) return;
    if (this.keyValueStorageClient) {
      await this.keyValueStorageClient.connect();
    }

    await this.databaseClient.connect();
    await this.server.start();
    this.started = true;
  }

  public async stop(): Promise<void> {
    if (this.keyValueStorageClient) {
      await this.keyValueStorageClient.disconnect();
      // this.keyValueStorageClient = undefined;
    }
    // quit db
    // quit all
    await this.databaseClient.disconnect();
    // process.exit(0);
    await this.server.stop();
  }

  public async seedData(): Promise<void> {
    await this.seedUsers();
  }

  public async seedUsers(): Promise<IUser[]> {
    const { userUseCases } = this.composeUsersModule();
    const requests: Promise<IUser>[] = [];
    for (const user of users) {
      requests.push(new Promise((resolve, reject) => {
        (async () => {
          try {
            const newUser = await userUseCases.create(user);
            if (newUser.error) throw newUser.error;
            if (!newUser.result) throw new Error('User seed failed');
            resolve(newUser.result);
          } catch (error: any) {
            // console.log(error.message);
            reject(new Error(error.message));
          }
        })();
      }));
    }
    return Promise.all(requests);
    // console.log('>>>> done');
  }

  public async deleteUsers(): Promise<boolean[]> {
    const { userUseCases } = this.composeUsersModule();
    const requests: Promise<boolean>[] = [];
    const allUsers = (await userUseCases.getAll({}, { page: 1, size: 1000 })).result || [];
    for (const user of allUsers) {
      requests.push(new Promise((resolve, reject) => {
        (async () => {
          try {
            const deletedUser = await userUseCases.delete(user.id);
            if (deletedUser.error) throw deletedUser.error;
            if (deletedUser.result === undefined) throw new Error('User delete failed');
            resolve(deletedUser.result);
          } catch (error: any) {
            // console.log(error.message);
            reject(new Error(error.message));
          }
        })();
      }));
    }
    return Promise.all(requests);
    // console.log('>>>> done');
  }

  private composeUsersModule(): ReturnType<typeof composeUsersAuthServices> {
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
      eventBus: this.eventBus,
      messageMediator: this.messageMediator
    });
    return this.usersComposition;
  }
}

export default RestAPI;
