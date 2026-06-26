/* eslint-disable jest/max-expects */
import { UserService } from '@src/modules/Users/service/UserService';
import { EDocumentType } from '@src/modules/ddd/valueObjects/EDocumentType';
import { EEmailType } from '@src/modules/ddd/valueObjects/EEmailType';
import { UserIntegrationEventName } from '@src/modules/Users/events/contracts/UserIntegrationEventName';

import { createUser } from '@src/modules/Users/features/createUser';
import { updateUser } from '@src/modules/Users/features/updateUser';
import { deleteUserById } from '@src/modules/Users/features/deleteUserById';
import { getUserById } from '@src/modules/Users/features/getUserById';
import { getAllUsers } from '@src/modules/Users/features/getAllUsers';
import { updatePassword } from '@src/modules/Users/features/updatePassword';
import { createDocument } from '@src/modules/Users/features/createDocument';
import { updateDocument } from '@src/modules/Users/features/updateDocument';
import { deleteDocument } from '@src/modules/Users/features/deleteDocument';
import { createPhone } from '@src/modules/Users/features/createPhone';
import { updatePhone } from '@src/modules/Users/features/updatePhone';
import { deletePhone } from '@src/modules/Users/features/deletePhone';
import { createEmail } from '@src/modules/Users/features/createEmail';
import { updateEmail } from '@src/modules/Users/features/updateEmail';
import { deleteEmail } from '@src/modules/Users/features/deleteEmail';

jest.mock<typeof import('@src/modules/Users/features/createUser')>('@src/modules/Users/features/createUser', () => ({ createUser: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/updateUser')>('@src/modules/Users/features/updateUser', () => ({ updateUser: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/deleteUserById')>('@src/modules/Users/features/deleteUserById', () => ({ deleteUserById: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/getUserById')>('@src/modules/Users/features/getUserById', () => ({ getUserById: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/getAllUsers')>('@src/modules/Users/features/getAllUsers', () => ({ getAllUsers: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/updatePassword')>('@src/modules/Users/features/updatePassword', () => ({ updatePassword: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/createDocument')>('@src/modules/Users/features/createDocument', () => ({ createDocument: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/updateDocument')>('@src/modules/Users/features/updateDocument', () => ({ updateDocument: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/deleteDocument')>('@src/modules/Users/features/deleteDocument', () => ({ deleteDocument: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/createPhone')>('@src/modules/Users/features/createPhone', () => ({ createPhone: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/updatePhone')>('@src/modules/Users/features/updatePhone', () => ({ updatePhone: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/deletePhone')>('@src/modules/Users/features/deletePhone', () => ({ deletePhone: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/createEmail')>('@src/modules/Users/features/createEmail', () => ({ createEmail: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/updateEmail')>('@src/modules/Users/features/updateEmail', () => ({ updateEmail: jest.fn() }));
jest.mock<typeof import('@src/modules/Users/features/deleteEmail')>('@src/modules/Users/features/deleteEmail', () => ({ deleteEmail: jest.fn() }));

const mockedCreateUser = createUser as jest.MockedFunction<typeof createUser>;
const mockedUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;
const mockedDeleteUserById = deleteUserById as jest.MockedFunction<typeof deleteUserById>;
const mockedGetUserById = getUserById as jest.MockedFunction<typeof getUserById>;
const mockedGetAllUsers = getAllUsers as jest.MockedFunction<typeof getAllUsers>;
const mockedUpdatePassword = updatePassword as jest.MockedFunction<typeof updatePassword>;
const mockedCreateDocument = createDocument as jest.MockedFunction<typeof createDocument>;
const mockedUpdateDocument = updateDocument as jest.MockedFunction<typeof updateDocument>;
const mockedDeleteDocument = deleteDocument as jest.MockedFunction<typeof deleteDocument>;
const mockedCreatePhone = createPhone as jest.MockedFunction<typeof createPhone>;
const mockedUpdatePhone = updatePhone as jest.MockedFunction<typeof updatePhone>;
const mockedDeletePhone = deletePhone as jest.MockedFunction<typeof deletePhone>;
const mockedCreateEmail = createEmail as jest.MockedFunction<typeof createEmail>;
const mockedUpdateEmail = updateEmail as jest.MockedFunction<typeof updateEmail>;
const mockedDeleteEmail = deleteEmail as jest.MockedFunction<typeof deleteEmail>;

const baseUser = {
  id: 'u1',
  firstName: 'John',
  username: 'john',
  password: 'hashed',
  salt: 'salt',
  avatar: 'avatar.png',
  emails: [{
    id: 'e1', email: 'john@example.com', type: EEmailType.personal, isPrimary: true
  }],
  documents: [{
    id: 'd1', type: EDocumentType.CPF, countryIssue: 'BR', data: '111'
  }],
  phones: [{
    id: 'p1', countryCode: '55', localCode: '11', number: '999', isPrimary: true
  }],
  roles: ['user']
};

const setup = () => {
  const mutexService = {
    lock: jest.fn().mockResolvedValue({ result: { previouslyLocked: false } }),
    unlock: jest.fn().mockResolvedValue({ result: true })
  };
  const passwordCryptoService = {
    hash: jest.fn().mockResolvedValue({ hash: 'hashed', salt: 'salt' }),
    compare: jest.fn()
  };
  const eventBus = { publish: jest.fn().mockResolvedValue(true) };

  const service = new UserService({
    dataRepository: {} as any,
    services: { mutexService, passwordCryptoService, eventBus }
  } as any);

  return {
    service, mutexService, passwordCryptoService, eventBus
  };
};

describe('user service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateUser.mockResolvedValue(baseUser as any);
    mockedUpdateUser.mockResolvedValue(baseUser as any);
    mockedDeleteUserById.mockResolvedValue(true);
    mockedGetUserById.mockResolvedValue(baseUser as any);
    mockedGetAllUsers.mockResolvedValue({
      page: 1, size: 10, total: 1, result: [baseUser]
    } as any);
    mockedUpdatePassword.mockResolvedValue(baseUser as any);
    mockedCreateDocument.mockResolvedValue(baseUser as any);
    mockedUpdateDocument.mockResolvedValue(baseUser as any);
    mockedDeleteDocument.mockResolvedValue(baseUser as any);
    mockedCreatePhone.mockResolvedValue(baseUser as any);
    mockedUpdatePhone.mockResolvedValue(baseUser as any);
    mockedDeletePhone.mockResolvedValue(baseUser as any);
    mockedCreateEmail.mockResolvedValue(baseUser as any);
    mockedUpdateEmail.mockResolvedValue(baseUser as any);
    mockedDeleteEmail.mockResolvedValue(baseUser as any);
  });

  it('creates and fetches users with sanitized output and integration event', async () => {
    expect.hasAssertions();
    const { service, eventBus } = setup();

    const created = await service.create({
      firstName: 'John',
      username: 'john',
      password: '12345678',
      emails: [{ email: 'john@example.com', type: EEmailType.personal }]
    } as any);
    expect((created.result as any)?.password).toBeUndefined();
    expect((created.result as any)?.salt).toBeUndefined();
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: UserIntegrationEventName.Created
    }));

    const one = await service.getOneById('u1');
    expect((one.result as any)?.password).toBeUndefined();

    const all = await service.getAll({ username: 'john' }, { page: 1, size: 10 });
    expect((all.result?.[0] as any)?.password).toBeUndefined();
  });

  it('covers update/delete and lock conflict behavior', async () => {
    expect.hasAssertions();
    const { service, mutexService } = setup();

    const updated = await service.update('u1', { firstName: 'Mary' } as any);
    expect(updated.result?.id).toBe('u1');
    expect(mutexService.unlock).toHaveBeenCalledWith('User', 'u1');

    const deleted = await service.delete('u1');
    expect(deleted.result).toBe(true);

    mutexService.lock.mockResolvedValueOnce({ result: { previouslyLocked: true } });
    const locked = await service.update('u1', { firstName: 'Mary' } as any);
    expect(locked.error).toBeDefined();
  });

  it('covers password and aggregate mutation operations', async () => {
    expect.hasAssertions();
    const { service, eventBus } = setup();

    const password = await service.updatePassword('u1', { password: '12345678' } as any);
    expect((password.result as any)?.password).toBeUndefined();
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: UserIntegrationEventName.PasswordUpdated
    }));

    expect((await service.createDocument('u1', { type: EDocumentType.RG, countryIssue: 'BR', data: '1' } as any)).result?.id).toBe('u1');
    expect((await service.updateDocument('u1', 'd1', { type: EDocumentType.SSN, countryIssue: 'US', data: '2' } as any)).result?.id).toBe('u1');
    expect((await service.deleteDocument('u1', 'd1')).result?.id).toBe('u1');
    expect((await service.createPhone('u1', { countryCode: '55', localCode: '11', number: '9' } as any)).result?.id).toBe('u1');
    expect((await service.updatePhone('u1', 'p1', { countryCode: '55', localCode: '11', number: '8' } as any)).result?.id).toBe('u1');
    expect((await service.deletePhone('u1', 'p1')).result?.id).toBe('u1');
    expect((await service.createEmail('u1', { email: 'john@example.com', type: EEmailType.personal } as any)).result?.id).toBe('u1');
    expect((await service.updateEmail('u1', 'e1', { email: 'john+2@example.com', type: EEmailType.work } as any)).result?.id).toBe('u1');
    expect((await service.deleteEmail('u1', 'e1')).result?.id).toBe('u1');
  });

  it('handles failures through service response errors', async () => {
    expect.hasAssertions();
    const { service } = setup();
    mockedGetAllUsers.mockRejectedValueOnce(new Error('boom'));
    const getAll = await service.getAll({}, { page: 1, size: 10 });
    expect(getAll.error).toBeDefined();

    const invalidCreate = await service.create({
      firstName: 'John',
      username: 'john',
      password: '123',
      emails: [{ email: 'john@example.com', type: EEmailType.personal }]
    } as any);
    expect(invalidCreate.error).toBeDefined();
  });

  it('keeps main flow when integration publish fails and handles lookup failure', async () => {
    expect.hasAssertions();
    const { service, eventBus } = setup();
    eventBus.publish.mockRejectedValueOnce(new Error('integration down'));

    const created = await service.create({
      firstName: 'John',
      username: 'john',
      password: '12345678',
      emails: [{ email: 'john@example.com', type: EEmailType.personal }]
    } as any);
    expect(created.result?.id).toBe('u1');

    mockedGetAllUsers.mockRejectedValueOnce(new Error('boom'));
    const response = await service.getOneByUsernameForAuth('john');
    expect(response.error).toBeDefined();
  });

  it('returns locked errors for all mutex-protected operations', async () => {
    expect.hasAssertions();
    const { service, mutexService } = setup();
    mutexService.lock.mockResolvedValue({ result: { previouslyLocked: true } });

    const calls = await Promise.all([
      service.update('u1', { firstName: 'Mary' } as any),
      service.delete('u1'),
      service.updatePassword('u1', { password: '12345678' } as any),
      service.createDocument('u1', { type: EDocumentType.RG, countryIssue: 'BR', data: '1' } as any),
      service.updateDocument('u1', 'd1', { type: EDocumentType.SSN, countryIssue: 'US', data: '2' } as any),
      service.deleteDocument('u1', 'd1'),
      service.createPhone('u1', { countryCode: '55', localCode: '11', number: '9' } as any),
      service.updatePhone('u1', 'p1', { countryCode: '55', localCode: '11', number: '8' } as any),
      service.deletePhone('u1', 'p1'),
      service.createEmail('u1', { email: 'john@example.com', type: EEmailType.personal } as any),
      service.updateEmail('u1', 'e1', { email: 'john+2@example.com', type: EEmailType.work } as any),
      service.deleteEmail('u1', 'e1')
    ]);

    for (const response of calls) {
      expect(response.error).toBeDefined();
    }
  });

  it('exposes factory compile', () => {
    expect.hasAssertions();
    const { mutexService, passwordCryptoService, eventBus } = setup();
    const service = UserService.compile({
      dataRepository: {} as any,
      services: { mutexService, passwordCryptoService, eventBus }
    } as any);
    expect(service).toBeInstanceOf(UserService);
  });
});
