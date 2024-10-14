/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
// file deepcode ignore NoHardcodedCredentials/test: <fake credential>
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { JwtService } from '@src/infra/jwt/JwtService';

import {
  IUser, UserDataRepository, UserService, UserProviderLocal, IAuthorizationHeader, EAuthSchemaType
} from '@src/modules/Users';
import { handler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/create';

import {
  BasicAuthorizationHeaderUserGuest,
  user1,
  // user2,
  user3
} from '@test/mock';
import createdUsers from '@seed/users';
import { composeContext, composeHttpEvent } from '@test/integration/Lambda/utils';

const [createdUser1, createdUser2, createdUser3, createdUser4] = createdUsers;

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

let authorizationHeaderUser1: IAuthorizationHeader;
let authorizationHeaderUser2: IAuthorizationHeader;
let authorizationHeaderUser3: IAuthorizationHeader;
let authorizationHeaderUser4: IAuthorizationHeader;

describe('aws lambda -> Auth -> Bearer suite', () => {
  beforeAll(async () => {
    await databaseClient.connect();
    await keyValueStorageClient.connect();

    const requests: Promise<IUser>[] = [];
    for (const user of createdUsers) {
      requests.push(new Promise((resolve, reject) => {
        (async () => {
          try {
            // await service.create(user);
            const newUser = await userService.create(user);
            resolve(newUser.result);
          } catch (error: any) {
            // console.log(error.message);
            reject(new Error(error.message));
          }
        })();
      }));
    }
    await Promise.all(requests);

    authorizationHeaderUser1 = {
      ...(await authService.authenticate(
        createdUser1.username,
        createdUser1.password,
        EAuthSchemaType.Bearer
      )).result!
    };
    authorizationHeaderUser2 = {
      ...(await authService.authenticate(
        createdUser2.username,
        createdUser2.password,
        EAuthSchemaType.Bearer
      )).result!
    };
    authorizationHeaderUser3 = {
      ...(await authService.authenticate(
        createdUser3.username,
        createdUser3.password,
        EAuthSchemaType.Bearer
      )).result!
    };
    authorizationHeaderUser4 = {
      ...(await authService.authenticate(
        createdUser4.username,
        createdUser4.password,
        EAuthSchemaType.Bearer
      )).result!
    };
  });

  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
  });

  it('user1 must be able to create an user', async () => {
    expect.hasAssertions();

    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: user1,
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser1.Authorization}`
      }
    }), composeContext(), () => {});

    const { result } = JSON.parse(body);

    expect(statusCode).toBe(201);
    expect(result.firstName).toBe(user1.firstName);
    expect(result.lastName).toBe(user1.lastName);
  });

  it('user1 must not be able to create a duplicated username', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: user1,
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser1.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(message).toBe('Conflict - username already in use');
    expect(statusCode).toBe(409);
  });

  it('user1 must not be able to create a user with empty username', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: { ...user1, username: '', password: '12345678' },
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser1.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(message).toBe('Bad Request - username can not be empty');
    expect(statusCode).toBe(400);
  });

  it('user1 must not be able to create a user with empty password', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: { ...user1, username: 'loginname', password: '' },
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser1.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(message).toBe('Bad Request - password must have at least 8 chars.');
    expect(statusCode).toBe(400);
  });

  it('user1 must not be able to create a user with password having less than 8 chars', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: { ...user1, username: 'loginname', password: '1234567' },
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser1.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(message).toBe('Bad Request - password must have at least 8 chars.');
    expect(statusCode).toBe(400);
  });

  it('user1 must not be able to create an user with empty firstName', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: { ...user3, firstName: '' },
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser1.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(message).toBe('Bad Request - firstName can not be empty');
    expect(statusCode).toBe(400);
  });

  it('user1 must not be able to create new user with unknown field', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: { invalidFieldName: 50 },
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser1.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(message).toBe('Bad Request - The property invalidFieldName from input payload does not exist.');
    expect(statusCode).toBe(400);
  });

  it('user1 must not be able to create new user with empty payload', async () => {
    expect.hasAssertions();
    const { statusCode } = await handler(composeHttpEvent({
      path: '/users',
      body: {},
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser1.Authorization}`
      }
    }), composeContext(), () => {});
    // const { message } = JSON.parse(body);
    expect(statusCode).toBe(400);
  });

  it('user2 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: user1,
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser2.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(statusCode).toBe(403);
    expect(message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('user3 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: user1,
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser3.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(statusCode).toBe(403);
    expect(message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('user4 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: user1,
      method: 'POST',
      headers: {
        Authorization: `${authorizationHeaderUser4.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(statusCode).toBe(403);
    expect(message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('guest must not be able to create new user - Unauthorized', async () => {
    expect.hasAssertions();
    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/users',
      body: user1,
      method: 'POST',
      headers: {
        Authorization: `${BasicAuthorizationHeaderUserGuest.Authorization}`
      }
    }), composeContext(), () => {});
    const { message } = JSON.parse(body);
    expect(statusCode).toBe(401);
    expect(message).toBe('Unauthorized - user not found');
  });
});
