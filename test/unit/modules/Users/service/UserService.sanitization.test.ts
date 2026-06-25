import { UserService } from '@src/modules/Users/service/UserService';
import { IUser } from '@src/modules/Users';

const userWithSecrets = (id: string): IUser & { salt: string } => ({
  id,
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'avatar.png',
  username: `john-${id}@xpertminds.dev`,
  password: 'password_hash',
  salt: 'salt_hash',
  emails: [] as any[],
  documents: [],
  phones: [],
  roles: ['access_allow']
});

const modelFrom = (user: IUser & { salt?: string }) => ({
  serialize: () => ({ ...user })
});

describe('user service secret sanitization', () => {
  const mockDataRepository: any = {
    getOneById: jest.fn(async (id: string) => modelFrom(userWithSecrets(id))),
    getAll: jest.fn(async () => ({
      page: 1,
      size: 10,
      total: 1,
      result: [modelFrom(userWithSecrets('all'))]
    })),
    updatePassword: jest.fn(async (id: string) => modelFrom(userWithSecrets(id)))
  };

  const passwordCryptoService: any = {
    hash: jest.fn(async () => ({ hash: 'new_hash', salt: 'new_salt' }))
  };

  const mutexService: any = {
    lock: jest.fn(async () => ({ result: { previouslyLocked: false } })),
    unlock: jest.fn(async () => ({ result: true }))
  };

  const service = new UserService({
    dataRepository: mockDataRepository,
    services: {
      passwordCryptoService,
      mutexService
    }
  } as any);

  it('should remove password and salt from getOneById', async () => {
    expect.hasAssertions();
    const { result } = await service.getOneById('one');
    expect(result?.password).toBeUndefined();
    expect((result as any)?.salt).toBeUndefined();
  });

  it('should remove password and salt from getAll', async () => {
    expect.hasAssertions();
    const { result } = await service.getAll({}, { page: 1, size: 10 });
    expect(result?.[0].password).toBeUndefined();
    expect((result?.[0] as any)?.salt).toBeUndefined();
  });

  it('should remove password and salt from updatePassword', async () => {
    expect.hasAssertions();
    const { result } = await service.updatePassword('update-password', { password: '12345678' });
    expect(result?.password).toBeUndefined();
    expect((result as any)?.salt).toBeUndefined();
  });
});
