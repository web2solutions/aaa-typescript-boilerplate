/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs';
import YAML from 'yaml';
import { OpenAPIV3 } from 'openapi-types';

import { _API_PREFIX_, _DOCS_PREFIX_ } from '@src/config/constants';
import { replaceVars } from '@src/infra/utils';
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
  private _oas: Map<string, OpenAPIV3.Document> = new Map();

  private _started: boolean = false;

  private _server: HTTPBaseServer<T>;

  private _serverType: EHTTPFrameworks;

  private _databaseClient: IDatabaseClient;

  private _mutexClient: IMutexService | undefined;

  private _authService: IAuthService | undefined;

  private _passwordCryptoService: IPasswordCryptoService | undefined;

  private _keyValueStorageClient: IKeyValueStorageClient | undefined;

  constructor(config: IAPIFactory<T>) {
    this._serverType = config.serverType ?? EHTTPFrameworks.express;
    this._server = config.webServer;

    this._databaseClient = config.databaseClient;

    if (config.keyValueStorageClient) {
      this._keyValueStorageClient = config.keyValueStorageClient;
    }

    if (config.mutexService) {
      this._mutexClient = config.mutexService;
    }

    if (config.authService) {
      this._authService = config.authService;
      // this._authService?.start();
    }

    if (config.passwordCryptoService) {
      this._passwordCryptoService = config.passwordCryptoService;
    }

    this._buildWithOAS();
    this._buildInfraEndPoints(config);

    process.on('exit', () => {
      this.stop();
    });

    process.on('unhandledRejection', (e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    });
  }

  public get databaseClient(): IDatabaseClient {
    return this._databaseClient;
  }

  public get mutexService(): IMutexService | undefined {
    return this._mutexClient;
  }

  _buildInfraEndPoints(config: IAPIFactory<T>): void {
    const noServiceInjection = {
      databaseClient: {} as IDatabaseClient,
      spec: {} as OpenAPIV3.Document,
      endPointConfig: {}
    };

    const localhostGet = config.infraHandlers.localhostGetHandlerFactory({ ...noServiceInjection });
    this._server.endPointRegister(localhostGet);

    // serve API docs as JSON
    const apiVersionsGet = config.infraHandlers.apiVersionsGetHandlerFactory({
      ...noServiceInjection,
      apiDocs: this._oas,
      authService: this._authService || ({} as IAuthService)

    });
    this._server.endPointRegister(apiVersionsGet);

    for (const [version, spec] of this._oas) {
      this._server.endPointRegister({
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

  _buildWithOAS(): void {
    // console.time('Load spec files');
    const specs = fs.readdirSync('./spec');
    for (const version of specs) {
      const file = fs.readFileSync(`./spec/${version}`, 'utf8');
      const jsonOAS: OpenAPIV3.Document = YAML.parse(file);
      this._oas.set(jsonOAS.info.version, jsonOAS);
    }
    this._buildEndPoints();
    // console.timeEnd('Load spec files');
  }

  _buildEndPoints(): void {
    for (const [version, spec] of this._oas) {
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
            authService: this._authService,
            openApiSpecification: spec,
            databaseClient: this._databaseClient,
            mutexService: this._mutexClient,
            passwordCryptoService: this._passwordCryptoService
          });

          const handlerPath = `@src/modules/${moduleName}/interface/api/frameworks/${this._serverType}/handlers/${endPointConfig.operationId}`;
          const handlerFactory = require(handlerPath).default({
            databaseClient: this._databaseClient,
            mutexService: this._mutexClient,
            endPointConfig,
            spec,
            authService: this._authService,
            controller
          });

          this._server.endPointRegister({
            ...handlerFactory,
            path: `${_API_PREFIX_}/${version}${replaceVars(handlerFactory.path)}`
          });
        }
      }
    }
  }

  public get server(): HTTPBaseServer<T> {
    return this._server;
  }

  public async start(): Promise<void> {
    if (this._started) return;
    if (this._keyValueStorageClient) {
      await this._keyValueStorageClient.connect();
    }

    await this._databaseClient.connect();
    await this._server.start();
    this._started = true;
  }

  public async stop(): Promise<void> {
    if (this._keyValueStorageClient) {
      await this._keyValueStorageClient.disconnect();
      this._keyValueStorageClient = undefined;
    }
    // quit db
    // quit all
    await this._databaseClient.disconnect();
    // process.exit(0);
  }

  public async seedData(): Promise<void> {
    await this.seedUsers();
  }

  public async seedUsers(): Promise<IUser[]> {
    const dataRepository = UserDataRepository.compile({ databaseClient: this._databaseClient });
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
    const dataRepository = UserDataRepository.compile({ databaseClient: this._databaseClient });
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
