import { registerUserMessageHandlers } from '@src/modules/Users/events/listeners/registerUserMessageHandlers';
import { UserMessageContracts } from '@src/modules/Users/events/contracts/UserMessageContracts';

describe('registerUserMessageHandlers', () => {
  it('registers and resolves authorize and ensure-access contracts', async () => {
    expect.hasAssertions();
    const handlers: Record<string, any> = {};
    const messageMediator = {
      registerHandler: jest.fn((contract: string, handler: any) => {
        handlers[contract] = handler;
      })
    };
    const authService = {
      authorize: jest.fn().mockResolvedValue({
        id: 'u1',
        username: 'john',
        roles: ['access_allow']
      }),
      throwIfUserHasNoAccessToResource: jest.fn()
    };

    registerUserMessageHandlers(messageMediator as any, authService as any);

    const authorizeResponse = await handlers[UserMessageContracts.Authorize]({
      contract: UserMessageContracts.Authorize,
      payload: { authorization: 'Bearer token' }
    });
    const accessResponse = await handlers[UserMessageContracts.EnsureAccess]({
      contract: UserMessageContracts.EnsureAccess,
      payload: {
        authorization: 'Bearer token',
        schemaOAS: { security: [{ bearerAuth: ['access_allow'] }] }
      }
    });

    expect(messageMediator.registerHandler).toHaveBeenCalledTimes(2);
    expect(authorizeResponse.result).toStrictEqual(expect.objectContaining({ id: 'u1' }));
    expect(accessResponse.result).toStrictEqual(expect.objectContaining({ id: 'u1' }));
    expect(authService.throwIfUserHasNoAccessToResource).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1' }),
      expect.objectContaining({ security: expect.any(Array) })
    );
  });

  it('returns error in response when auth service throws', async () => {
    expect.hasAssertions();
    const handlers: Record<string, any> = {};
    const messageMediator = {
      registerHandler: jest.fn((contract: string, handler: any) => {
        handlers[contract] = handler;
      })
    };
    const authService = {
      authorize: jest.fn().mockRejectedValue(new Error('invalid token')),
      throwIfUserHasNoAccessToResource: jest.fn()
    };

    registerUserMessageHandlers(messageMediator as any, authService as any);

    const response = await handlers[UserMessageContracts.EnsureAccess]({
      contract: UserMessageContracts.EnsureAccess,
      payload: {
        authorization: 'Bearer invalid',
        schemaOAS: {}
      }
    });

    expect(response.error).toBeInstanceOf(Error);
    expect((response.error as Error).message).toBe('invalid token');
  });

  it('returns error in authorize contract when auth service throws', async () => {
    expect.hasAssertions();
    const handlers: Record<string, any> = {};
    const messageMediator = {
      registerHandler: jest.fn((contract: string, handler: any) => {
        handlers[contract] = handler;
      })
    };
    const authService = {
      authorize: jest.fn().mockRejectedValue(new Error('authorize failed')),
      throwIfUserHasNoAccessToResource: jest.fn()
    };

    registerUserMessageHandlers(messageMediator as any, authService as any);

    const response = await handlers[UserMessageContracts.Authorize]({
      contract: UserMessageContracts.Authorize,
      version: 1,
      payload: { authorization: 'Bearer invalid' }
    });

    expect(response.error).toBeInstanceOf(Error);
    expect((response.error as Error).message).toBe('authorize failed');
  });
});
