/* eslint-disable jest/require-hook */
import fs from 'fs';
import path from 'path';
import { v4 } from 'uuid';
import { OpenAPIV3 } from 'openapi-types';
import YAML from 'yaml';

import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/aws/lambda/responses/sendErrorResponse';

import {
  UserDataRepository,
  UserService,
  UserController,
  UserProviderLocal,
  AuthService,
  UserCreateRequestEvent
} from '@src/modules/Users';

import { BaseError } from '@src/infra/exceptions';
import { Context } from '@src/infra/context/Context';
import { JwtService } from '@src/infra/jwt/JwtService';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';

const ENV = process.env.NODE_ENV || 'dev';
let OasFilePath = path.resolve('../../spec/1.0.0.yml');

if (ENV === 'ci') {
  OasFilePath = path.resolve('./spec/1.0.0.yml');
}

const OasYmlfile = fs.readFileSync(path.resolve(OasFilePath), 'utf8');
const openApiSpecification: OpenAPIV3.Document = YAML.parse(OasYmlfile);

const databaseClient = InMemoryDbClient;
const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);

// LOCAL IDENTITY PROVIDER
const dataRepository = UserDataRepository.compile({
  databaseClient: InMemoryDbClient
});
const userService = UserService.compile({
  dataRepository,
  services: {
    passwordCryptoService,
    mutexService
  }
});
const userProvider = UserProviderLocal.compile(userService);

const authService = AuthService.compile(
  userProvider,
  passwordCryptoService,
  jwtService
);
// LOCAL IDENTITY PROVIDER

const controller = new UserController({
  authService,
  openApiSpecification,
  databaseClient,
  mutexService,
  passwordCryptoService
});

export const handler: Handler = async (event: APIGatewayProxyEvent):
Promise<APIGatewayProxyResult> => {
  return new Promise((resolve) => {
    const headers = event.headers || {};
    const authorization = headers.authorization || headers.Authorization || 'Bearer';
    const endPoint = event.path;
    const method = event.httpMethod.toLocaleLowerCase();
    const endPointConfigs: Record<string, any> = openApiSpecification.paths[endPoint] ?? {};
    const endPointConfig: Record<string, any> = endPointConfigs[method];
    const store = new Map();
    Context.run(store, async () => {
      try {
        store.set('correlationId', v4());
        store.set('timeStart', +new Date());
        store.set('request', event);
        store.set('authorization', event.headers.authorization || '');

        const { result, error } = await controller.create(new UserCreateRequestEvent({
          authorization,
          input: event.body,
          schemaOAS: endPointConfig
        }));

        if (error) throw error;

        return resolve({
          statusCode: 201,
          body: JSON.stringify({ result, error })
        });
      } catch (error: unknown) {
        return resolve(sendErrorResponse(error as BaseError));
      }
    });
  });
};
