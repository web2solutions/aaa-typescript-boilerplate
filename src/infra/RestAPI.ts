/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs';
import YAML from 'yaml';
import { OpenAPIV3 } from 'openapi-types';

import { replaceVars } from '@src/infra/utils';

import { HTTPBaseServer } from '@src/infra/server/HTTP/ports/HTTPBaseServer';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IMutexClient } from '@src/infra/mutex/port/IMutexClient';

import { IUser, UserDataRepository, UserService } from '@src/domains/Users';

import users from '@seed/users';

import { IAPIFactory } from '@src/infra/server/HTTP/ports/IAPIFactory';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { _API_PREFIX_, _DOCS_PREFIX_ } from './config/constants';
import { IAuthService } from './auth/IAuthService';
import { IPasswordCryptoService } from './security/PasswordCryptoService';

export class RestAPI<T> {
  #_oas: Map<string, OpenAPIV3.Document> = new Map();

  #_started: boolean = false;

  #_server: HTTPBaseServer<T>;

  #_serverType: EHTTPFrameworks;

  #_dbClient: IDatabaseClient;

  #_mutexClient: IMutexClient | undefined;

  #_authService: IAuthService | undefined;

  #_passwordCryptoService: IPasswordCryptoService | undefined;

  constructor(config: IAPIFactory<T>) {
    this.#_serverType = config.serverType ?? EHTTPFrameworks.express;
    this.#_server = config.webServer;

    this.#_dbClient = config.databaseClient;

    if (config.mutexService) {
      this.#_mutexClient = config.mutexService;
      this.#_mutexClient?.connect();
    }

    if (config.authService) {
      this.#_authService = config.authService;
      this.#_authService?.start();
    }

    if (config.passwordCryptoService) {
      this.#_passwordCryptoService = config.passwordCryptoService;
    }

    this.#_buildWithOAS();
    this.#_buildInfraEndPoints(config);

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
    return this.#_dbClient;
  }

  public get mutexClient(): IMutexClient | undefined {
    return this.#_mutexClient;
  }

  #_buildInfraEndPoints(config: IAPIFactory<T>): void {
    const noServiceInjection = {
      databaseClient: {} as IDatabaseClient,
      spec: {} as OpenAPIV3.Document,
      endPointConfig: {}
    };

    const localhostGet = config.infraHandlers.localhostGetHandlerFactory({ ...noServiceInjection });
    this.#_server.endPointRegister(localhostGet);

    // serve API docs as JSON
    const apiVersionsGet = config.infraHandlers.apiVersionsGetHandlerFactory({
      ...noServiceInjection,
      apiDocs: this.#_oas,
      authService: this.#_authService || ({} as IAuthService)

    });
    this.#_server.endPointRegister(apiVersionsGet);

    for (const [version, spec] of this.#_oas) {
      this.#_server.endPointRegister({
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

  #_buildWithOAS(): void {
    // console.time('Load spec files');
    const specs = fs.readdirSync('./src/infra/spec');
    for (const version of specs) {
      const file = fs.readFileSync(`./src/infra/spec/${version}`, 'utf8');
      const jsonOAS: OpenAPIV3.Document = YAML.parse(file);
      this.#_oas.set(jsonOAS.info.version, jsonOAS);
    }
    this.#_buildEndPoints();
    // console.timeEnd('Load spec files');
  }

  #_buildEndPoints(): void {
    for (const [version, spec] of this.#_oas) {
      for (const path of Object.keys(spec.paths)) {
        const endPointConfigs: Record<string, any> = spec.paths[path] ?? {};
        const methods: string[] = Object.keys(endPointConfigs);
        for (const method of methods) {
          const endPointConfig: Record<string, any> = endPointConfigs[method];
          const domain = path.split('/')[1];
          const fileName = `${domain.charAt(0).toUpperCase()}${domain.substring(1, domain.length - 1)}Controller`;
          const Controller = require(`@src/infra/server/HTTP/adapters/controllers/${fileName}`)[fileName]; // UserController

          const controller = new Controller({
            authService: this.#_authService,
            openApiSpecification: spec,
            databaseClient: this.#_dbClient,
            passwordCryptoService: this.#_passwordCryptoService
          });

          const handlerFactory = require(`@src/infra/server/HTTP/adapters/${this.#_serverType}/handlers/${domain}/${endPointConfig.operationId}`).default({
            databaseClient: this.#_dbClient,
            mutexClient: this.#_mutexClient,
            endPointConfig,
            spec,
            authService: this.#_authService,
            controller
          });
          this.#_server.endPointRegister({
            ...handlerFactory,
            path: `${_API_PREFIX_}/${version}${replaceVars(handlerFactory.path)}`
          });
        }
      }
    }
  }

  public get server(): HTTPBaseServer<T> {
    return this.#_server;
  }

  public async start(): Promise<void> {
    if (this.#_started) return;
    await this.#_dbClient.connect();
    await this.#_server.start();
    this.#_started = true;
  }

  public async stop(): Promise<void> {
    // quit db
    // quit all
    await this.#_dbClient.disconnect();
    if (this.#_mutexClient) {
      await this.#_mutexClient.disconnect();
    }
    // process.exit(0);
  }

  public async seedData(): Promise<void> {
    await this.seedUsers();
  }

  public async seedUsers(): Promise<IUser[]> {
    const repo = UserDataRepository.compile({ databaseClient: this.#_dbClient });
    const service = UserService.compile({ repo });
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
            reject(error);
          }
        })();
      }));
    }
    return Promise.all(requests);
    // console.log('>>>> done');
  }
}

export default RestAPI;
