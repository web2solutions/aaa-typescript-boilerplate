import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';

describe('user provider local', () => {
  it('delegates all provider operations to user service', async () => {
    expect.hasAssertions();
    const userService = {
      create: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      update: jest.fn().mockResolvedValue({ result: { id: 'u1', username: 'john' } }),
      delete: jest.fn().mockResolvedValue({ result: true }),
      getOneByUsernameForAuth: jest.fn().mockResolvedValue({ result: { id: 'u1', username: 'john' } }),
      updatePassword: jest.fn().mockResolvedValue({ result: { id: 'u1' } })
    };

    const provider = UserProviderLocal.compile(userService as any) as UserProviderLocal;

    await provider.register({ username: 'john', password: '12345678' });
    await provider.update('u1', { username: 'johnny' });
    await provider.delete('u1');
    await provider.findUser('john');
    await provider.updatePassword('u1', 'new-password');

    expect(userService.create).toHaveBeenCalledWith({ username: 'john', password: '12345678' });
    expect(userService.update).toHaveBeenCalledWith('u1', { username: 'johnny' });
    expect(userService.delete).toHaveBeenCalledWith('u1');
    expect(userService.getOneByUsernameForAuth).toHaveBeenCalledWith('john');
    expect(userService.updatePassword).toHaveBeenCalledWith('u1', { password: 'new-password' });
  });
});
