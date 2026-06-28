/* eslint-disable jest/require-hook */
import fs from 'fs';
import path from 'path';
import { OpenAPIV3 } from 'openapi-types';
import YAML from 'yaml';
import { v4 } from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { Context } from '@src/infra/context/Context';
import { JwtService } from '@src/infra/jwt/JwtService';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { compileDatabaseClient } from '@src/infra/persistence/compileDatabaseClient';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { compileMessageMediator } from '@src/infra/messages/compileMessageMediator';
import { composeUsersAuthServices } from '@src/modules/Users/composition/composeUsersAuthServices';
import { UserController } from '@src/modules/Users/adapters/in/http/controllers/UserController';
import { AuthController } from '@src/modules/Users/adapters/in/http/controllers/AuthController';
import { OrganizationController } from '@src/modules/Users/adapters/in/http/controllers/OrganizationController';

const OasFilePath = path.resolve('./spec/1.0.0.yml');
const OasYmlfile = fs.readFileSync(path.resolve(OasFilePath), 'utf8');
const openApiSpecification: OpenAPIV3.Document = YAML.parse(OasYmlfile);

const databaseClient = compileDatabaseClient();
const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);
const messageMediator = compileMessageMediator();

const {
  authService,
  userUseCases,
  organizationUseCases,
  authUseCases
} = composeUsersAuthServices({
  databaseClient,
  passwordCryptoService,
  mutexService,
  jwtService,
  keyValueStorageClient,
  messageMediator
});

export const userController = new UserController({
  authService,
  openApiSpecification,
  databaseClient,
  userUseCases,
  authUseCases,
  mutexService,
  passwordCryptoService,
  messageMediator
});

export const authController = new AuthController({
  authService,
  openApiSpecification,
  databaseClient,
  userUseCases,
  authUseCases,
  mutexService,
  passwordCryptoService,
  messageMediator
});

export const organizationController = new OrganizationController({
  authService,
  openApiSpecification,
  databaseClient,
  userUseCases,
  organizationUseCases,
  authUseCases,
  mutexService,
  passwordCryptoService,
  messageMediator
});

export const getSchemaOAS = (event: APIGatewayProxyEvent): Record<string, any> => {
  const method = event.httpMethod.toLocaleLowerCase();
  const endPointConfigs: Record<string, any> = openApiSpecification.paths[event.path] ?? {};
  return endPointConfigs[method] ?? {};
};

export const withLambdaContext = async <T>(
  event: APIGatewayProxyEvent,
  runner: () => Promise<T>
): Promise<T> => {
  const headers = event.headers || {};
  const authorization = headers.authorization || headers.Authorization || 'Bearer';
  const store = new Map();

  return new Promise((resolve, reject) => {
    Context.run(store, async () => {
      try {
        store.set('correlationId', v4());
        store.set('timeStart', +new Date());
        store.set('request', event);
        store.set('authorization', authorization);
        resolve(await runner());
      } catch (error) {
        reject(error);
      }
    });
  });
};
