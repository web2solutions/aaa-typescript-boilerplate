import { AuthService } from '@src/modules/Users/service/AuthService';
import { EAuthSchemaType } from '@src/modules/Users/service/ports/EAuthSchemaType';
import { EUserRole } from '@src/modules/Users/domain/security/Rbac';

describe('auth service security audit integration', () => {
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
    const eventBus = { publish: jest.fn().mockResolvedValue(true) };
    const securityAuditRepository = { record: jest.fn().mockResolvedValue(undefined) };

    const service = new AuthService(
      userProvider as any,
      passwordCryptoService as any,
      jwtService as any,
      undefined,
      eventBus as any,
      securityAuditRepository as any
    );

    return {
      service,
      passwordCryptoService,
      eventBus,
      securityAuditRepository
    };
  };

  it('records login success in audit sink', async () => {
    expect.assertions(2);
    const { service, securityAuditRepository } = setup();
    const response = await service.authenticate('john', 'secret', EAuthSchemaType.Bearer);
    expect(response.result?.Authorization).toContain('Bearer ');
    expect(securityAuditRepository.record).toHaveBeenCalledWith(expect.objectContaining({
      name: 'users.auth.login.success',
      outcome: 'success'
    }));
  });

  it('records login failure in audit sink', async () => {
    expect.assertions(2);
    const { service, passwordCryptoService, securityAuditRepository } = setup();
    passwordCryptoService.compare.mockResolvedValueOnce(false);
    const response = await service.authenticate('john', 'invalid', EAuthSchemaType.Bearer);
    expect(response.error?.message).toBe('password does not matches');
    expect(securityAuditRepository.record).toHaveBeenCalledWith(expect.objectContaining({
      name: 'users.auth.login.failed',
      outcome: 'failed'
    }));
  });

  it('records privileged scope deny and allow events', async () => {
    expect.assertions(3);
    const { service, securityAuditRepository } = setup();
    expect(() => service.throwIfUserHasNoAccessToResource(
      {
        id: 'u1',
        username: 'john',
        firstName: 'John',
        organization: 'org-1',
        roles: [EUserRole.admin]
      } as any,
      { security: [{ bearerAuth: ['delete_organization'] }] } as any
    )).toThrow('Insufficient permission - user must have the delete_organization role');

    service.throwIfUserHasNoAccessToResource(
      {
        id: 'u1',
        username: 'john',
        firstName: 'John',
        organization: 'org-1',
        roles: [EUserRole.admin]
      } as any,
      { security: [{ bearerAuth: ['read_user'] }] } as any
    );

    await new Promise((resolve) => { setImmediate(resolve); });

    const names = securityAuditRepository.record.mock.calls.map((call: any[]) => call[0]?.name);
    expect(names).toContain('users.authz.scope.denied');
    expect(names).toContain('users.authz.scope.allowed');
  });
});
