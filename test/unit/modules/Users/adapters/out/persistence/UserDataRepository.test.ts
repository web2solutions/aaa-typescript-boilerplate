/* eslint-disable jest/max-expects */
import { UUID } from '@src/modules/port';
import { UserDataRepository, exclude } from '@src/modules/Users/adapters/out/persistence/UserDataRepository';
import { EDocumentType } from '@src/modules/ddd/valueObjects/EDocumentType';
import { EEmailType } from '@src/modules/ddd/valueObjects/EEmailType';

const createPayload = () => ({
  firstName: 'John',
  lastName: 'Doe',
  username: 'john',
  organization: '00000000-0000-4000-8000-000000000077',
  password: '12345678',
  salt: 'salt',
  avatar: 'avatar.png',
  emails: [{ email: 'john@example.com', type: EEmailType.personal, isPrimary: true }],
  documents: [{ type: EDocumentType.CPF, countryIssue: 'BR', data: '11111111111' }],
  phones: [{
    countryCode: '55', localCode: '11', number: '999999999', isPrimary: true
  }],
  roles: ['user']
});

describe('user data repository', () => {
  it('excludes keys from record', () => {
    expect.hasAssertions();
    const value = exclude({ a: 1, b: 2 }, ['b']);
    expect(value).toStrictEqual({ a: 1 });
  });

  it('covers CRUD and nested aggregate operations', async () => {
    expect.hasAssertions();
    const userId = UUID.create().toString();
    const documentId = UUID.create().toString();
    const phoneId = UUID.create().toString();
    const emailId = UUID.create().toString();

    const baseUser = {
      id: userId,
      ...createPayload(),
      documents: [{
        id: documentId, type: EDocumentType.CPF, countryIssue: 'BR', data: '11111111111'
      }],
      phones: [{
        id: phoneId, countryCode: '55', localCode: '11', number: '999999999', isPrimary: true
      }],
      emails: [{
        id: emailId, email: 'john@example.com', type: EEmailType.personal, isPrimary: true
      }]
    };

    const store = {
      create: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockImplementation(async (_id: string, data: any) => ({
        id: userId,
        ...data
      })),
      delete: jest.fn().mockResolvedValue(true),
      getOneById: jest.fn().mockResolvedValue(baseUser),
      getAll: jest.fn().mockResolvedValue({
        result: [baseUser],
        page: 1,
        size: 10,
        total: 1
      })
    };

    const repository = new UserDataRepository({
      databaseClient: { stores: { User: store } } as any
    });

    const created = await repository.create(createPayload() as any);
    expect(created.password).toBe('********');
    expect(created.salt).toBe('***');

    const updated = await repository.update(userId, {
      id: userId,
      firstName: 'Mary',
      username: 'mary',
      emails: [{
        id: emailId, email: 'mary@example.com', type: EEmailType.personal, isPrimary: true
      }]
    } as any);
    expect(updated.firstName).toBe('Mary');

    await expect(repository.delete(userId)).resolves.toBe(true);

    const one = await repository.getOneById(userId);
    expect(one.id).toBe(userId);

    const all = await repository.getAll({ username: 'john' }, { page: 1, size: 10 });
    expect(all.total).toBe(1);

    const updatedPassword = await repository.updatePassword(userId, { password: 'new-hash', salt: 'new-salt' });
    expect(updatedPassword.password).toBe('new-hash');

    const createdDocument = await repository.createDocument(userId, {
      type: EDocumentType.RG,
      countryIssue: 'BR',
      data: '123456'
    } as any);
    expect(createdDocument.documents.length).toBeGreaterThan(0);

    const updatedDocument = await repository.updateDocument(userId, documentId, {
      type: EDocumentType.SSN,
      countryIssue: 'US',
      data: '222'
    } as any);
    expect(updatedDocument.documents.find((d) => d.id === documentId)?.data).toBe('222');

    const deletedDocument = await repository.deleteDocument(userId, documentId);
    expect(deletedDocument.documents.find((d) => d.id === documentId)).toBeUndefined();

    const createdPhone = await repository.createPhone(userId, {
      countryCode: '1',
      localCode: '212',
      number: '1111111'
    } as any);
    expect(createdPhone.phones.length).toBeGreaterThan(0);

    const updatedPhone = await repository.updatePhone(userId, phoneId, {
      countryCode: '1',
      localCode: '646',
      number: '2222222'
    } as any);
    expect(updatedPhone.phones.find((p) => p.id === phoneId)?.number).toBe('2222222');

    const deletedPhone = await repository.deletePhone(userId, phoneId);
    expect(deletedPhone.phones.find((p) => p.id === phoneId)).toBeUndefined();

    const createdEmail = await repository.createEmail(userId, {
      email: 'new@example.com',
      type: EEmailType.work
    } as any);
    expect(createdEmail.emails.length).toBeGreaterThan(0);

    const updatedEmail = await repository.updateEmail(userId, emailId, {
      email: 'updated@example.com',
      type: EEmailType.work
    } as any);
    expect(updatedEmail.emails.find((e) => e.id === emailId)?.email).toBe('updated@example.com');

    const deletedEmail = await repository.deleteEmail(userId, emailId);
    expect(deletedEmail.emails.find((e) => e.id === emailId)).toBeUndefined();
  });
});
