/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jest/valid-expect */
/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
// file deepcode ignore NoHardcodedCredentials/test: <fake credential>
import users from '@seed/users';

import { UserDataRepository, UserService } from '@src/domains/Users';
import { AuthService } from '@src/infra/auth/AuthService';
import { UserProviderLocal } from '@src/infra/auth/UserProviderLocal';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';

import { EAuthSchemaType } from '@src/infra/auth/EAuthSchemaType';
import { IAuthService } from '@src/infra/auth/IAuthService';
import { JwtService } from '@src/infra/jwt/JwtService';

const databaseClient = InMemoryDbClient;
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);
const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();

const dataRepository = UserDataRepository.compile({
  databaseClient
});
const userService = UserService.compile({
  dataRepository,
  services: {
    passwordCryptoService,
    mutexService
  }
});

const userProvider = UserProviderLocal.compile(userService);

let createdUser0: any;
let createdUser1: any;
let createdUser1AuthorizationHeader: any;
let createdUser2AuthorizationHeader: any;

let authService: IAuthService;

describe('unit test suite for AuthService', () => {
  beforeAll(async () => {
    await keyValueStorageClient.connect();
    authService = AuthService.compile(
      userProvider,
      passwordCryptoService,
      jwtService
    );
  });
  describe('user authentication and authorization', () => {
    beforeAll(async () => {
      const { result, error } = await userService.create(users[0]);
      // console.log({ result, error });
      createdUser0 = result;
    });
    describe('testing HTTP Basic auth schema', () => {
      describe('authentication', () => {
        it('must authenticate with Basic auth schema with valid username and password - success', async () => {
          expect.hasAssertions();
          const [user0] = [...users];
          const { result } = await authService.authenticate(
            user0.username,
            user0.password,
            EAuthSchemaType.Basic
          );
          const { Authorization } = result!;
          // console.log(Authorization);
          const rawToken = Buffer.from(`${user0.username}:${user0.password}`, 'utf8').toString('base64');
          const [schema, token] = Authorization.split(' ');
          expect(schema).toBe(EAuthSchemaType.Basic);
          expect(rawToken).toBe(token);
        });
        it('must not authenticate with Basic auth schema with invalid username - return error - user not found', async () => {
          expect.hasAssertions();
          const [user0] = [...users];
          const { error } = await authService.authenticate(
            'fakeusername',
            user0.password,
            EAuthSchemaType.Basic
          );

          expect(error!.message).toBe('user not found');
        });
        // eslint-disable-next-line jest/prefer-expect-assertions
        it('must not authenticate with Basic auth schema with valid username and wrong password - return error - password does not matches', async () => {
          expect.hasAssertions();
          const [user0] = [...users];
          const { error } = await authService.authenticate(
            user0.username,
            'fake_password',
            EAuthSchemaType.Basic
          );

          expect(error!.message).toBe('password does not matches');
        });
        // eslint-disable-next-line jest/prefer-expect-assertions
        it('must not authenticate with Basic auth schema with valid username and invalid password -  return error - invalid password', async () => {
          expect.hasAssertions();
          const [user0] = [...users];
          const { error } = await authService.authenticate(
            user0.username,
            '1234567',
            EAuthSchemaType.Basic
          );
          expect(error!.message).toBe('password does not matches');
        });
      });
      // ==>>>
      describe('authorization', () => {
        beforeAll(async () => {
          const [user0] = [...users];
          const { result } = await authService.authenticate(
            user0.username,
            user0.password,
            EAuthSchemaType.Basic
          );
          const { Authorization } = result!;
          createdUser1AuthorizationHeader = Authorization;
        });
        it('must authorize with a valid Basic token', async () => {
          expect.hasAssertions();
          const [user0] = [...users];
          const authorized = await authService.authorize(createdUser1AuthorizationHeader);
          expect(authorized).toBeTruthy();
          expect(authorized.username).toBe(user0.username);
        });
        // eslint-disable-next-line jest/prefer-expect-assertions
        it('must not authorize with a valid Basic token having wrong password - return error invalid password', async () => {
          // expect.hasAssertions();
          const [user0] = [...users];
          expect(async () => {
            const rawToken = Buffer.from(`${user0.username}:${user0.password}_`, 'utf8').toString('base64');
            return authService.authorize(`Basic ${rawToken}`);
          }).rejects.toThrow('invalid password');
        });
        // eslint-disable-next-line jest/prefer-expect-assertions
        it('must not authorize with a valid Basic token having wrong username - return error user not found', async () => {
          expect.hasAssertions();
          const [user0] = [...users];
          expect(async () => {
            const rawToken = Buffer.from(`${user0.username}_:${user0.password}`, 'utf8').toString('base64');
            return authService.authorize(`Basic ${rawToken}`);
          }).rejects.toThrow('user not found');
        });
        // eslint-disable-next-line jest/prefer-expect-assertions
        it('must not authorize with a invalid auth schema - return error invalid schema', async () => {
          expect.hasAssertions();
          const [user0] = [...users];
          expect(async () => {
            const rawToken = Buffer.from(`${user0.username}:${user0.password}`, 'utf8').toString('base64');
            return authService.authorize(`InvalidSchemaName ${rawToken}`);
          }).rejects.toThrow('invalid schema');
        });
        // eslint-disable-next-line jest/prefer-expect-assertions
        it('must not authorize with a invalid token - return error invalid token', async () => {
          expect.hasAssertions();
          const [user0] = [...users];
          expect(async () => {
            const rawToken = Buffer.from(`${user0.username}:${user0.password}`, 'utf8').toString('base64');
            return authService.authorize(`${rawToken}`);
          }).rejects.toThrow('invalid token');
        });
      });
      // ==>>>
    });

    // ==>>>
    describe('testing HTTP Bearer auth schema', () => {
      beforeAll(async () => {
        const { result, error } = await userService.create(users[1]);
        createdUser1 = result;
        authService = AuthService.compile(
          userProvider,
          passwordCryptoService,
          jwtService
        );
      });
      describe('authentication', () => {
        it('must authenticate with Bearer auth schema with valid username and password - success', async () => {
          expect.hasAssertions();
          const [user0, user1] = [...users];
          const { result } = await authService.authenticate(
            user1.username,
            user1.password,
            EAuthSchemaType.Bearer
          );
          const { Authorization } = result!;
          // console.log(Authorization);
          const rawToken = await jwtService.generateToken(user1);
          const [schema, token] = Authorization.split(' ');
          expect(schema).toBe(EAuthSchemaType.Bearer);
          expect(rawToken).toBe(token);
        });
        it('must not authenticate with Bearer auth schema with invalid username - return error - user not found', async () => {
          expect.hasAssertions();
          const [user0, user1] = [...users];
          const { error } = await authService.authenticate(
            'fakeusername',
            user1.password,
            EAuthSchemaType.Bearer
          );
          expect(error!.message).toBe('user not found');
        });
        // eslint-disable-next-line jest/prefer-expect-assertions
        it('must not authenticate with Bearer auth schema with valid username and wrong password - return error - password does not matches', async () => {
          expect.hasAssertions();
          const [user0, user1] = [...users];
          const { error } = await authService.authenticate(
            user1.username,
            'fake_password',
            EAuthSchemaType.Bearer
          );
          expect(error!.message).toBe('password does not matches');
        });
        // eslint-disable-next-line jest/prefer-expect-assertions
        it('must not authenticate with Bearer auth schema with valid username and 7 chars password - return error - password must have at least 8 chars.', async () => {
          expect.hasAssertions();
          const [user0, user1] = [...users];
          const { error } = await authService.authenticate(
            user1.username,
            '1234567',
            EAuthSchemaType.Bearer
          );
          expect(error!.message).toBe('password does not matches');
        });
      });

      describe('authorization', () => {
        beforeAll(async () => {
          const [user0, user1] = [...users];
          const { result } = await authService.authenticate(
            user1.username,
            user1.password,
            EAuthSchemaType.Bearer
          );
          const { Authorization } = result!;
          createdUser2AuthorizationHeader = Authorization;
        });
        it('must authorize with a valid Bearer token', async () => {
          expect.hasAssertions();
          const [user0, user1] = [...users];
          const authorized = await authService.authorize(createdUser2AuthorizationHeader);
          expect(authorized).toBeTruthy();
          expect(authorized.username).toBe(user1.username);
        });
        it('must not authorize with a valid Bearer token generated with a different server secret - return error invalid token', async () => {
          expect.hasAssertions();
          expect(async () => {
            const [user0, user1] = [...users];
            const jwtService2 = new JwtService('fakesecret');
            const token = await jwtService2.generateToken(user1);
            return authService.authorize(`Bearer ${token}`);
          }).rejects.toThrow('invalid token');
        });
        // jwtService.generateToken(userFound);
        // eslint-disable-next-line jest/prefer-expect-assertions
        it('must not authorize with a valid Bearer token - return error invalid token', async () => {
          expect.hasAssertions();
          const [user0, user1] = [...users];
          expect(async () => {
            const rawToken = Buffer.from(`${user1.username}:${user1.password}`, 'utf8').toString('base64');
            return authService.authorize(`Bearer ${rawToken}`);
          }).rejects.toThrow('invalid token');
        });
      });
      // ==>>>
    });
  });

  describe('registering user', () => {
    const [user0, user1, user2, user3, user4] = [...users];
    afterAll(async () => {
      await userService.delete(user1.id);
      await userService.delete(user2.id);
      await userService.delete(user3.id);
    });
    it('must register with valid data', async () => {
      expect.hasAssertions();
      // delete (user2 as any).password;
      const { result, error } = await authService.register(user2);
      // console.log({ result, error });
      expect(result!.firstName).toBe(user2.firstName);
      expect(result!.username).toBe(user2.username);
    });
    it('must not register with undefined password', async () => {
      expect.hasAssertions();
      delete (user3 as any).password;
      const { result, error } = await authService.register(user3);
      // console.log({ result, error });
      expect(error?.message).toBe('password must have at least 8 chars.');
    });
    it('must not register with invalid password', async () => {
      expect.hasAssertions();
      delete (user3 as any).password;
      const { result, error } = await authService.register({ ...user3, password: '1234567' });
      // console.log({ result, error });
      expect(error?.message).toBe('password must have at least 8 chars.');
    });
    it('must not register with undefined username', async () => {
      expect.hasAssertions();
      delete (user1 as any).username;
      const { result, error } = await authService.register(user1);
      // console.log({ result, error });
      expect(error?.message).toBe('username can not be empty');
    });
  });

  describe('updating user', () => {
    const [user0, user1, user2, user3, user4] = [...users];
    afterAll(async () => {
      await userService.delete(user1.id);
      await userService.delete(user2.id);
      await userService.delete(user3.id);
    });
    it('must update with valid data', async () => {
      expect.hasAssertions();
      // delete (user2 as any).password;
      const { result, error } = await authService.updateUser(user0.id, { ...user0, firstName: 'james' });
      // console.log({ result, error });
      expect(result!.firstName).toBe('james');
      expect(result!.username).toBe(user0.username);
      expect(error).toBeUndefined();
    });
    it('must NOT update with empty username', async () => {
      expect.hasAssertions();
      // delete (user2 as any).password;
      const { result, error } = await authService.updateUser(user0.id, { ...user0, username: '' });
      expect(error?.message).toBe('username can not be empty');
      expect(result).toBeUndefined();
    });
    it('must NOT update with invalid id', async () => {
      expect.hasAssertions();
      // delete (user2 as any).password;
      const { result, error } = await authService.updateUser('xxxxx', { ...user0, id: 'xxxxx' });
      expect(error?.message).toBe('Invalid UUID');
      expect(result).toBeUndefined();
    });
  });

  describe('deleting user', () => {
    // eslint-disable-next-line jest/require-hook, prefer-const
    let [user0, user1, user2, user3, user4] = [...users];
    beforeAll(async () => {
      await userService.delete(user1.id);
      await userService.delete(user2.id);
      await userService.delete(user3.id);
      user1 = await userService.create(user1);
      user2 = await userService.create(user2);
      user3 = await userService.create(user3);
    });
    it('must delete user1', async () => {
      expect.hasAssertions();
      const { result, error } = await authService.deleteUser(user1.id);
      expect(result).toBeTruthy();
      expect(error).toBeUndefined();
    });
    it('must delete user2', async () => {
      expect.hasAssertions();
      const { result, error } = await authService.deleteUser(user2.id);
      expect(result).toBeTruthy();
      expect(error).toBeUndefined();
    });
    it('must delete user3', async () => {
      expect.hasAssertions();
      const { result, error } = await authService.deleteUser(user3.id);
      expect(result).toBeTruthy();
      expect(error).toBeUndefined();
    });
  });
});
