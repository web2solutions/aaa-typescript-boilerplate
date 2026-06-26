/* eslint-disable jest/max-expects */
import { User } from '@src/modules/Users/domain/Model/User';
import { EDocumentType } from '@src/modules/ddd/valueObjects/EDocumentType';
import { EEmailType } from '@src/modules/ddd/valueObjects/EEmailType';

const basePayload = () => ({
  firstName: 'John',
  lastName: 'Doe',
  username: 'john',
  password: '12345678',
  salt: 'salt',
  avatar: 'avatar.png',
  emails: [{
    id: '00000000-0000-4000-8000-000000000011', email: 'john@example.com', type: EEmailType.personal, isPrimary: true
  }],
  documents: [{
    id: '00000000-0000-4000-8000-000000000012', type: EDocumentType.CPF, countryIssue: 'BR', data: '11111111111'
  }],
  phones: [{
    id: '00000000-0000-4000-8000-000000000013', countryCode: '55', localCode: '11', number: '999999999', isPrimary: true
  }],
  roles: ['user']
});

describe('user domain model', () => {
  it('exposes openapi 3.1 compliant data entity schema', () => {
    expect.hasAssertions();
    expect(User.dataEntitySchema.name).toBe('User');
    expect(User.dataEntitySchema.fields).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        name: 'id',
        format: 'uuid'
      })
    ]));
  });

  it('creates and mutates aggregate value objects', () => {
    expect.hasAssertions();
    const user = new User(basePayload());

    expect(user.firstName).toBe('John');
    user.firstName = 'Mary';
    user.lastName = 'Jane';
    user.avatar = 'avatar2.png';
    user.username = 'mary';
    user.password = 'new-password';
    user.salt = 'new-salt';
    expect(user.firstName).toBe('Mary');
    expect(user.roles).toContain('user');

    user.createPhone({ countryCode: '1', localCode: '212', number: '1111111' });
    const phoneId = user.phones[0].id;
    expect(user.updatePhone({
      id: phoneId, countryCode: '1', localCode: '646', number: '2222222'
    })).toBe(true);
    expect(user.deletePhone(phoneId)).toBe(true);
    expect(user.deletePhone('missing')).toBe(false);

    user.createDocument({ type: EDocumentType.RG, countryIssue: 'BR', data: '222' });
    const documentId = user.documents[0].id;
    expect(user.updateDocument({
      id: documentId, type: EDocumentType.SSN, countryIssue: 'US', data: '333'
    })).toBe(true);
    expect(user.deleteDocument(documentId)).toBe(true);
    expect(user.deleteDocument('missing')).toBe(false);

    user.createEmail({ email: 'jane@example.com', type: EEmailType.work });
    const emailId = user.emails[0].id;
    expect(user.updateEmail({ id: emailId, email: 'jane+1@example.com', type: EEmailType.work })).toBe(true);
    expect(user.deleteEmail(emailId)).toBe(true);
    expect(user.deleteEmail('missing')).toBe(false);
  });

  it('enforces read only fields', () => {
    expect.hasAssertions();
    const user = new User({ ...basePayload(), readOnly: true });
    expect(() => { user.firstName = 'Mary'; }).toThrow('read only');
    expect(() => { user.createEmail({ email: 'new@example.com', type: EEmailType.work }); }).toThrow('read only');
  });
});
