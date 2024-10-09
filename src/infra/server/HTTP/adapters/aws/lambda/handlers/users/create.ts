/* eslint-disable jest/require-hook */
import fs from 'fs';
import path from 'path';

import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { OpenAPIV3 } from 'openapi-types';
import YAML from 'yaml';

import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/infra/auth/AuthService';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { UserDataRepository, UserService } from '@src/domains/Users';
import { UserProviderLocal } from '@src/infra/auth/UserProviderLocal';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserController } from '@src/infra/server/HTTP/adapters/controllers/UserController';
import { UserCreateRequestEvent } from '@src/domains/Users/events/UserCreateRequestEvent';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/aws/lambda/responses/sendErrorResponse';

const ENV = process.env.NODE_ENV || 'dev';
let OasFilePath = path.resolve('../../src/infra/spec/1.0.0.yml');

if (ENV === 'ci') {
  OasFilePath = path.resolve('./src/infra/spec/1.0.0.yml');
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
  const headers = event.headers || {};
  const authorization = headers.authorization || headers.Authorization || 'Bearer';
  const endPoint = event.path;
  const method = event.httpMethod.toLocaleLowerCase();
  try {
    const endPointConfigs: Record<string, any> = openApiSpecification.paths[endPoint] ?? {};
    const endPointConfig: Record<string, any> = endPointConfigs[method];
    const { result, error } = await controller!.create!(new UserCreateRequestEvent({
      authorization,
      input: event.body,
      schemaOAS: endPointConfig
    }));
    if (error) throw error;
    return {
      statusCode: 201,
      body: JSON.stringify({ result, error })
    };
  } catch (error: unknown) {
    return sendErrorResponse(error as Error);
  }
};
