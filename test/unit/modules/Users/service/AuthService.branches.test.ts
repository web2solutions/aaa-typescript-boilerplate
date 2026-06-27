import { AuthService } from '@src/modules/Users/service/AuthService';
import { EAuthSchemaType } from '@src/modules/Users/service/ports/EAuthSchemaType';
import { EUserRole } from '@src/modules/Users/domain/security/Rbac';

const setup = () => {
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
    jwtService as any
  );

  return {
    service,
    userProvider,
    jwtService
  };
};

describe('auth service extra branches', () => {
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
});
