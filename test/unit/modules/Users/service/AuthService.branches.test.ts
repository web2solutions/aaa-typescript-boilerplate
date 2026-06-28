import { AuthService } from '@src/modules/Users/service/AuthService';
import { EAuthSchemaType } from '@src/modules/Users/service/ports/EAuthSchemaType';
import { EUserRole } from '@src/modules/Users/domain/security/Rbac';

const setup = (options: {
  keyValueStorageClient?: Record<string, any>;
  eventBus?: Record<string, any>;
} = {}) => {
  const userProvider = {
    findUser: jest.fn().mockResolvedValue({
      id: 'u1',
      username: 'john',
      password: 'hashed',
      organization: 'org-1',
      roles: [EUserRole.admin]
    }),
    updatePassword: jest.fn().mockResolvedValue({ result: true }),
    register: jest.fn().mockResolvedValue({ result: { id: 'u2' } }),
    update: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
    delete: jest.fn().mockResolvedValue({ result: true })
  };
  const passwordCryptoService = {
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn()
  };
  const jwtService = {
    decodeToken: jest.fn().mockReturnValue({ id: 'u1', username: 'john' }),
    generateToken: jest.fn().mockReturnValue('jwt-token')
  };

  const service = new AuthService(
    userProvider as any,
    passwordCryptoService as any,
    jwtService as any,
    options.keyValueStorageClient as any,
    options.eventBus as any
  );

  return {
    service,
    userProvider,
    jwtService,
    passwordCryptoService
  };
};

describe('auth service extra branches', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'dev',
      AAA_ENABLE_BASIC_AUTH: 'yes'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('covers lifecycle no-op methods', async () => {
    expect.hasAssertions();
    const { service } = setup();
    await expect(service.start()).resolves.toBeUndefined();
    await expect(service.stop()).resolves.toBeUndefined();
  });

  it('covers decodeToken branches for bearer and basic', async () => {
    expect.hasAssertions();
    const { service, jwtService, userProvider } = setup();
    jwtService.decodeToken.mockReturnValueOnce(null);
    await expect(service.decodeToken('Bearer invalid')).resolves.toBeNull();

    userProvider.findUser.mockResolvedValueOnce({ id: '', username: 'john' });
    const basicToken = Buffer.from('john:secret', 'utf8').toString('base64');
    await expect(service.decodeToken(`Basic ${basicToken}`)).resolves.toBeNull();

    userProvider.findUser.mockResolvedValueOnce({ id: 'u9', username: 'john' });
    await expect(service.decodeToken(`Basic ${basicToken}`)).resolves.toStrictEqual({
      id: 'u9',
      username: 'john'
    });
  });

  it('covers register default role strategy', async () => {
    expect.hasAssertions();
    const { service, userProvider } = setup();

    await service.register({ username: 'admin@corp.test', organization: 'org-1' });
    expect(userProvider.register).toHaveBeenCalledWith(expect.objectContaining({
      roles: [EUserRole.user]
    }));

    await service.register({ username: 'legacy@test.dev' });
    expect(userProvider.register).toHaveBeenCalledWith(expect.objectContaining({
      roles: ['access_allow']
    }));
  });

  it('covers updatePassword not-found branch and logout', async () => {
    expect.hasAssertions();
    const { service, userProvider } = setup();
    userProvider.updatePassword.mockResolvedValueOnce({ result: null });
    const notFound = await service.updatePassword('u1', 'new-password');
    expect(notFound.error?.message).toBe('user not found');

    const logout = await service.logout();
    expect(logout.result).toBe(true);
  });

  it('covers access guard error branches', () => {
    expect.hasAssertions();
    const { service } = setup();

    expect(() => service.throwIfUserHasNoAccessToResource({} as any, {} as any)).toThrow(
      'there is no security schema defined'
    );

    expect(() => service.throwIfUserHasNoAccessToResource(
      {
        id: 'u1',
        username: 'john',
        firstName: 'john',
        avatar: '',
        organization: 'org-1'
      } as any,
      { security: [{ bearerAuth: ['read_user'] }] } as any
    )).toThrow('user.roles is missing');

    expect(() => service.throwIfUserHasNoAccessToResource(
      {
        id: 'u2',
        username: 'john',
        firstName: 'john',
        avatar: '',
        organization: 'org-1',
        roles: ['read_user']
      } as any,
      { security: [{ bearerAuth: ['delete_user'] }] } as any
    )).toThrow('Insufficient permission - user must have the delete_user role');
  });

  it('covers authorizeBasedInTokenType bearer path', async () => {
    expect.hasAssertions();
    const { service } = setup();
    const response = await service.authorizeBasedInTokenType({
      type: EAuthSchemaType.Bearer,
      token: 'jwt-token'
    });
    expect(response).toStrictEqual(expect.objectContaining({ id: 'u1' }));
  });

  it('covers lockout and audit paths for authentication', async () => {
    expect.hasAssertions();
    const store = new Map<string, any>();
    const keyValueStorageClient = {
      get: jest.fn().mockImplementation(async (key: string) => ({ result: store.get(key) })),
      set: jest.fn().mockImplementation(async (key: string, value: any) => {
        store.set(key, value);
        return { result: true };
      }),
      del: jest.fn().mockImplementation(async (key: string) => {
        store.delete(key);
        return { result: true };
      })
    };
    const eventBus = {
      publish: jest.fn().mockResolvedValue(true)
    };
    const {
      service,
      userProvider,
      passwordCryptoService
    } = setup({ keyValueStorageClient, eventBus });
    store.set('auth:locked:john', { expiresAt: Date.now() + 10_000 });

    const blocked = await service.authenticate('john', 'invalid', EAuthSchemaType.Bearer);
    expect(blocked.error?.message).toBe('authentication temporarily locked');
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: 'users.auth.login.blocked'
    }));

    store.clear();
    userProvider.findUser.mockResolvedValueOnce({
      id: 'u1',
      username: 'john',
      password: 'hashed'
    });
    passwordCryptoService.compare.mockResolvedValueOnce(false);
    const failed = await service.authenticate('john', 'invalid', EAuthSchemaType.Bearer);
    expect(failed.error?.message).toBe('password does not matches');
    expect(keyValueStorageClient.set).toHaveBeenCalledWith(
      'auth:failures:john',
      expect.objectContaining({
        count: expect.any(Number),
        expiresAt: expect.any(Number)
      })
    );
  });

  it('covers production credential masking and basic schema disablement', async () => {
    expect.hasAssertions();
    process.env.NODE_ENV = 'production';
    process.env.AAA_ENABLE_BASIC_AUTH = 'no';

    const { service, passwordCryptoService } = setup();
    passwordCryptoService.compare.mockResolvedValueOnce(false);
    const failed = await service.authenticate('john', 'invalid', EAuthSchemaType.Bearer);
    expect(failed.error?.message).toBe('invalid credentials');

    const basicToken = Buffer.from('john:secret', 'utf8').toString('base64');
    await expect(service.authorize(`Basic ${basicToken}`)).rejects.toThrow('invalid schema');
  });

  it('covers token revocation on logout and revoked decode checks', async () => {
    expect.hasAssertions();
    const store = new Map<string, any>();
    const keyValueStorageClient = {
      get: jest.fn().mockImplementation(async (key: string) => ({ result: store.get(key) })),
      set: jest.fn().mockImplementation(async (key: string, value: any) => {
        store.set(key, value);
        return { result: true };
      }),
      del: jest.fn().mockResolvedValue({ result: true })
    };

    const token = {
      id: 'u1',
      username: 'john',
      jti: 'token-1',
      exp: Math.floor(Date.now() / 1000) + 300
    };
    const { service, jwtService } = setup({ keyValueStorageClient });
    jwtService.decodeToken.mockReturnValue(token);

    const logout = await service.logout('Bearer test-token');
    expect(logout.result).toBe(true);
    expect(keyValueStorageClient.set).toHaveBeenCalledWith(
      'auth:revoked:token-1',
      expect.objectContaining({ revoked: true, expiresAt: expect.any(Number) })
    );

    await expect(service.decodeToken('Bearer test-token')).rejects.toThrow('invalid token');
  });

  it('covers expiration cleanup, lock threshold and clear-failed-login flows', async () => {
    expect.hasAssertions();
    process.env.AAA_AUTH_MAX_LOGIN_ATTEMPTS = '1';
    process.env.AAA_AUTH_LOCKOUT_SECONDS = '1';
    const store = new Map<string, any>();
    const keyValueStorageClient = {
      get: jest.fn().mockImplementation(async (key: string) => ({ result: store.get(key) })),
      set: jest.fn().mockImplementation(async (key: string, value: any) => {
        store.set(key, value);
        return { result: true };
      }),
      del: jest.fn().mockImplementation(async (key: string) => {
        store.delete(key);
        return { result: true };
      })
    };
    const { service, passwordCryptoService } = setup({ keyValueStorageClient });
    store.set('auth:locked:john', { expiresAt: Date.now() - 10 });
    passwordCryptoService.compare.mockResolvedValueOnce(false);
    await service.authenticate('john', 'invalid', EAuthSchemaType.Bearer);
    expect(keyValueStorageClient.del).toHaveBeenCalledWith('auth:locked:john');
    expect(keyValueStorageClient.set).toHaveBeenCalledWith(
      'auth:locked:john',
      expect.objectContaining({
        count: 1,
        expiresAt: expect.any(Number)
      })
    );

    store.delete('auth:locked:john');
    store.set('auth:failures:john', { count: 1, expiresAt: Date.now() + 10_000 });
    passwordCryptoService.compare.mockResolvedValueOnce(true);
    const response = await service.authenticate('john', 'valid', EAuthSchemaType.Bearer);
    expect(response.result?.Authorization).toContain('Bearer ');
    expect(keyValueStorageClient.del).toHaveBeenCalledWith('auth:failures:john');
  });

  it('covers basic-disabled decode path, basic auth branch and update/logout error branches', async () => {
    expect.hasAssertions();
    process.env.AAA_ENABLE_BASIC_AUTH = 'no';
    const { service, userProvider, jwtService } = setup();

    const basicToken = Buffer.from('john:secret', 'utf8').toString('base64');
    await expect(service.authorizeBasedInTokenType({
      type: EAuthSchemaType.Basic,
      token: basicToken
    })).rejects.toThrow('invalid schema');
    await expect(service.decodeToken(`Basic ${basicToken}`)).resolves.toBeNull();

    userProvider.updatePassword.mockResolvedValueOnce({ result: true });
    const updated = await service.updatePassword('u1', 'new-password');
    expect(updated.result).toBe(true);

    jwtService.decodeToken.mockReturnValueOnce(null);
    const logout = await service.logout('Bearer token');
    expect(logout.result).toBe(false);
    expect(logout.error?.message).toBe('invalid token');
  });

  it('covers fallback env branches and authorization header guards', async () => {
    expect.hasAssertions();
    process.env.AAA_ENABLE_BASIC_AUTH = '';
    process.env.AAA_AUTH_MAX_LOGIN_ATTEMPTS = '';
    process.env.AAA_AUTH_LOGIN_WINDOW_SECONDS = '';
    process.env.AAA_AUTH_LOCKOUT_SECONDS = '';
    process.env.NODE_ENV = 'prod';
    const { service, passwordCryptoService } = setup();
    passwordCryptoService.compare.mockResolvedValueOnce(false);
    const failed = await service.authenticate('john', 'invalid', EAuthSchemaType.Bearer);
    expect(failed.error?.message).toBe('invalid credentials');

    await expect(service.authorize('')).rejects.toThrow('invalid token');
    await expect(service.authorize('Digest abc')).rejects.toThrow('invalid schema');
  });

  it('covers logout branch when token has no expiration metadata', async () => {
    expect.hasAssertions();
    const keyValueStorageClient = {
      get: jest.fn().mockResolvedValue({ result: null }),
      set: jest.fn().mockResolvedValue({ result: true }),
      del: jest.fn().mockResolvedValue({ result: true })
    };
    const { service, jwtService } = setup({ keyValueStorageClient });
    jwtService.decodeToken.mockReturnValueOnce({
      id: 'u1',
      username: 'john',
      jti: 'token-without-exp'
    });
    const response = await service.logout('Bearer token');
    expect(response.result).toBe(true);
    expect(keyValueStorageClient.set).not.toHaveBeenCalled();
  });
});
