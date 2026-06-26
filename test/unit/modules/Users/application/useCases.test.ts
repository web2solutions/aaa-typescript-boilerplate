/* eslint-disable jest/prefer-called-with */
import { AuthUseCases } from '@src/modules/Users/application/AuthUseCases';
import { UserUseCases } from '@src/modules/Users/application/UserUseCases';
import { EAuthSchemaType } from '@src/modules/Users/service/ports/EAuthSchemaType';

describe('users application use cases', () => {
  it('delegates login and register in auth use cases', async () => {
    expect.hasAssertions();
    const authService: any = {
      authenticate: jest.fn().mockResolvedValue({ result: { token: 't' } }),
      register: jest.fn().mockResolvedValue({ result: { id: 'u1' } })
    };
    const mutexService: any = { lock: jest.fn(), unlock: jest.fn() };
    const useCases = new AuthUseCases(authService, mutexService);

    await useCases.login({ username: 'john', password: '12345678' });
    expect(authService.authenticate).toHaveBeenCalledWith(
      'john',
      '12345678',
      EAuthSchemaType.Bearer
    );

    await useCases.login({
      username: 'john',
      password: '12345678',
      schemaType: EAuthSchemaType.Basic
    });
    expect(authService.authenticate).toHaveBeenLastCalledWith(
      'john',
      '12345678',
      EAuthSchemaType.Basic
    );

    await useCases.register({ username: 'john', password: '12345678' } as any);
    expect(authService.register).toHaveBeenCalled();
  });

  it('handles updatePassword lock, unlock and invalid token paths', async () => {
    expect.hasAssertions();
    const authService: any = {
      decodeToken: jest.fn().mockResolvedValue({ id: 'u1' }),
      updatePassword: jest.fn().mockResolvedValue({ result: true })
    };
    const mutexService: any = {
      lock: jest.fn().mockResolvedValue({ result: { previouslyLocked: false } }),
      unlock: jest.fn().mockResolvedValue({ result: true })
    };
    const useCases = new AuthUseCases(authService, mutexService);

    const ok = await useCases.updatePassword('Bearer token', { password: '12345678' });
    expect(ok.result).toBe(true);
    expect(mutexService.lock).toHaveBeenCalledWith('user', 'u1');
    expect(mutexService.unlock).toHaveBeenCalledWith('user', 'u1');

    mutexService.lock.mockResolvedValueOnce({ result: { previouslyLocked: true } });
    const locked = await useCases.updatePassword('Bearer token', { password: '12345678' });
    expect(locked.error).toBeDefined();

    authService.decodeToken.mockResolvedValueOnce(undefined);
    const invalid = await useCases.updatePassword('Bearer token', { password: '12345678' });
    expect(invalid.error).toBeDefined();
  });

  it('handles logout success and validation error paths', async () => {
    expect.hasAssertions();
    const authService: any = {
      decodeToken: jest.fn().mockResolvedValue({ username: 'john' }),
      logout: jest.fn().mockResolvedValue({ result: true })
    };
    const mutexService: any = { lock: jest.fn(), unlock: jest.fn() };
    const useCases = new AuthUseCases(authService, mutexService);

    const ok = await useCases.logout('Bearer token', { username: 'john' });
    expect(ok.result).toBe(true);

    const invalid = await useCases.logout('Bearer token', { username: 'mary' });
    expect(invalid.error).toBeDefined();
  });

  it('delegates all user use case methods to user service', async () => {
    expect.hasAssertions();
    const userService: any = {
      create: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      update: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      delete: jest.fn().mockResolvedValue({ result: true }),
      getOneById: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      getAll: jest.fn().mockResolvedValue({ result: [] }),
      updatePassword: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      createDocument: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      updateDocument: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      deleteDocument: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      createPhone: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      updatePhone: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      deletePhone: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      createEmail: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      updateEmail: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      deleteEmail: jest.fn().mockResolvedValue({ result: { id: 'u1' } })
    };
    const useCases = new UserUseCases(userService);

    await useCases.create({ firstName: 'J', username: 'john' } as any);
    await useCases.update('u1', { firstName: 'John' } as any);
    await useCases.delete('u1');
    await useCases.getOneById('u1');
    await useCases.getAll({ active: 1 }, { page: 1, size: 10 });
    await useCases.updatePassword('u1', { password: '12345678' } as any);
    await useCases.createDocument('u1', { type: 'cpf' } as any);
    await useCases.updateDocument('u1', 'd1', { type: 'cpf' } as any);
    await useCases.deleteDocument('u1', 'd1');
    await useCases.createPhone('u1', { number: '9999' } as any);
    await useCases.updatePhone('u1', 'p1', { number: '9999' } as any);
    await useCases.deletePhone('u1', 'p1');
    await useCases.createEmail('u1', { email: 'john@mail.com' } as any);
    await useCases.updateEmail('u1', 'e1', { email: 'john@mail.com' } as any);
    await useCases.deleteEmail('u1', 'e1');

    expect(userService.create).toHaveBeenCalled();
    expect(userService.update).toHaveBeenCalledWith('u1', { firstName: 'John' });
    expect(userService.getAll).toHaveBeenCalledWith({ active: 1 }, { page: 1, size: 10 });
    expect(userService.deleteEmail).toHaveBeenCalledWith('u1', 'e1');
  });
});
