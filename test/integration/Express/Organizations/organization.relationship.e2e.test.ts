/* global describe, it, expect */
/* eslint-disable jest/max-expects */
import request from 'supertest';
import { Express } from 'express';
import { ExpressServer } from '@src/interface/HTTP/adapters/express/ExpressServer';
import { RestAPI } from '@src/interface/HTTP/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { infraHandlers } from '@src/interface/HTTP/adapters/express/handlers/infraHandlers';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { UserDataRepository, UserService } from '@src/modules/Users';
import { JwtService } from '@src/infra/jwt/JwtService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';
import createdUsers from '@seed/users';
import { EAuthSchemaType } from '@src/modules/Users/service/ports/EAuthSchemaType';

const webServer = ExpressServer.compile();
const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);

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

const serverType = EHTTPFrameworks.express;
const API: RestAPI<Express> = new RestAPI<Express>({
  databaseClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType,
  authService,
  passwordCryptoService,
  keyValueStorageClient,
  mutexService
});
const server = API.server.application;

describe('express -> organizations relationship e2e', () => {
  let authorizationHeaderUser1: Record<string, string>;

  beforeAll(async () => {
    await API.seedData();
    const [createdUser1] = createdUsers;
    authorizationHeaderUser1 = {
      ...(await authService.authenticate(
        createdUser1.username,
        createdUser1.password,
        EAuthSchemaType.Basic
      )).result!
    };
  });

  afterAll(async () => {
    await API.stop();
  });

  it('creates organization, links user, and exposes relationship', async () => {
    expect.hasAssertions();
    const marker = Date.now().toString();

    const createOrganizationResponse = await request(server)
      .post('/api/1.0.0/organizations')
      .send({
        name: `Tenant-${marker}`,
        address: [{ email: `hq-${marker}@tenant.dev`, type: 'work', isPrimary: true }],
        email: [{ email: `contact-${marker}@tenant.dev`, type: 'work', isPrimary: true }],
        phone: [{
          countryCode: 55,
          localCode: 11,
          number: `9${marker.slice(-8)}`,
          isPrimary: true
        }]
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);

    expect(createOrganizationResponse.statusCode).toBe(201);
    const organizationId = createOrganizationResponse.body.id as string;
    expect(organizationId).toBeTruthy();

    const createUserResponse = await request(server)
      .post('/api/1.0.0/users')
      .send({
        firstName: 'Org',
        lastName: 'Member',
        username: `org-member-${marker}@tenant.dev`,
        password: 'StrongPass123!',
        organization: organizationId,
        roles: ['admin'],
        emails: [{ email: `org-member-${marker}@tenant.dev`, type: 'work', isPrimary: true }]
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);

    expect(createUserResponse.statusCode).toBe(201);
    expect(createUserResponse.body.organization).toBe(organizationId);
    const userId = createUserResponse.body.id as string;

    const getOrganizationResponse = await request(server)
      .get(`/api/1.0.0/organizations/${organizationId}`)
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);

    expect(getOrganizationResponse.statusCode).toBe(200);
    expect(getOrganizationResponse.body.users).toContain(userId);

    const deleteUserResponse = await request(server)
      .delete(`/api/1.0.0/users/${userId}`)
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(deleteUserResponse.statusCode).toBe(200);

    const getOrganizationAfterDeleteResponse = await request(server)
      .get(`/api/1.0.0/organizations/${organizationId}`)
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(getOrganizationAfterDeleteResponse.statusCode).toBe(200);
    expect(getOrganizationAfterDeleteResponse.body.users).not.toContain(userId);
  });
});
