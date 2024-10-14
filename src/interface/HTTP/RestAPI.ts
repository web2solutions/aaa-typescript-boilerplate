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

import {
  IUser,
  UserDataRepository,
  UserService,
  IAuthService
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
      for (const path of Object.keys(spec.paths)) {
        const endPointConfigs: Record<string, any> = spec.paths[path] ?? {};
        const methods: string[] = Object.keys(endPointConfigs);
        for (const method of methods) {
          const endPointConfig: Record<string, any> = endPointConfigs[method];
          const module = path.split('/')[1];
          let controllerName = `${module.charAt(0).toUpperCase()}${module.substring(1, module.length - 1)}Controller`;
          let moduleName = `${module.charAt(0).toUpperCase()}${module.substring(1, module.length)}`;
          if (module === 'auth') {
            moduleName = 'Users';
            controllerName = 'AuthController';
          }
          const controllerPath = `@src/modules/${moduleName}/interface/controller/${controllerName}`;
          const ControllerModule = require(controllerPath)[controllerName];

          const controller = new ControllerModule({
            authService: this.authService,
            openApiSpecification: spec,
            databaseClient: this.databaseClient,
            mutexService: this.mutexClient,
            passwordCryptoService: this.passwordCryptoService
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
      }
    }
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
  }

  public async seedData(): Promise<void> {
    await this.seedUsers();
  }

  public async seedUsers(): Promise<IUser[]> {
    const dataRepository = UserDataRepository.compile({ databaseClient: this.databaseClient });
    const service = UserService.compile({ dataRepository });
    const requests: Promise<IUser>[] = [];
    for (const user of users) {
      requests.push(new Promise((resolve, reject) => {
        (async () => {
          try {
            // await service.create(user);
            const newUser = await service.create(user);
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

  public async deleteUsers(): Promise<IUser[]> {
    const dataRepository = UserDataRepository.compile({ databaseClient: this.databaseClient });
    const service = UserService.compile({ dataRepository });
    const requests: Promise<IUser>[] = [];
    const allUsers = (await service.getAll({}, { page: 1, size: 1000 })).result || [];
    for (const user of allUsers) {
      requests.push(new Promise((resolve, reject) => {
        (async () => {
          try {
            // await service.create(user);
            const newUser = await service.create(user);
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
}

export default RestAPI;
