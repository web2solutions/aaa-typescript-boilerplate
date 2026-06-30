import { Organization } from '@src/modules/Users/domain/Model/Organization';
import { EAddressType, EEmailType } from '@src/modules/ddd/valueObjects';
import { getModelRelations } from '@src/modules/port';

const payload = () => ({
  name: 'ACME',
  address: [{
    email: 'hq@acme.dev',
    type: EAddressType.work,
    isPrimary: true
  }],
  phone: [{
    countryCode: '55',
    localCode: '11',
    number: '999999',
    isPrimary: true
  }],
  email: [{
    email: 'contact@acme.dev',
    type: EEmailType.work,
    isPrimary: true
  }],
  users: ['u1']
});

describe('organization domain model', () => {
  it('exposes openapi schema and relation metadata', () => {
    expect.hasAssertions();
    expect(Organization.dataEntitySchema.name).toBe('Organization');
    const relations = getModelRelations(Organization as any);
    expect(relations).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({ property: 'userEntities', kind: 'hasMany' })
    ]));
  });

  it('creates organization and enforces read-only mode', () => {
    expect.hasAssertions();
    const organization = new Organization(payload());
    expect(organization.name).toBe('ACME');
    expect(organization.createdAt).toBeInstanceOf(Date);
    expect(organization.updatedAt).toBeInstanceOf(Date);

    const readOnly = new Organization({ ...payload(), readOnly: true });
    expect(() => { readOnly.name = 'New Name'; }).toThrow('read only');
  });

  it('maps value-object collections at construction', () => {
    expect.hasAssertions();
    const organization = new Organization(payload());
    expect(organization.address).toHaveLength(1);
    expect(organization.phone).toHaveLength(1);
    expect(organization.email).toHaveLength(1);
  });

  it('updates address/phone/email by id', () => {
    expect.hasAssertions();
    const organization = new Organization(payload());

    const currentAddress = organization.address[0];
    const currentPhone = organization.phone[0];
    const currentEmail = organization.email[0];

    expect(organization.updateAddress({ id: currentAddress.id, isPrimary: false })).toBe(true);
    expect(organization.updatePhone({ id: currentPhone.id, number: '123456' })).toBe(true);
    expect(organization.updateEmail({ id: currentEmail.id, isPrimary: false })).toBe(true);
  });

  it('deletes address/phone/email by id', () => {
    expect.hasAssertions();
    const organization = new Organization(payload());
    const currentAddress = organization.address[0];
    const currentPhone = organization.phone[0];
    const currentEmail = organization.email[0];
    expect(organization.deleteAddress(currentAddress.id)).toBe(true);
    expect(organization.deletePhone(currentPhone.id)).toBe(true);
    expect(organization.deleteEmail(currentEmail.id)).toBe(true);
  });
  it('returns false for missing ids in update helpers', () => {
    expect.hasAssertions();
    const organization = new Organization(payload());
    expect(organization.updateAddress({ id: 'missing', isPrimary: true })).toBe(false);
    expect(organization.updatePhone({ id: 'missing', number: 'x' })).toBe(false);
    expect(organization.updateEmail({ id: 'missing', isPrimary: true })).toBe(false);
  });

  it('returns false for missing ids in delete helpers', () => {
    expect.hasAssertions();
    const organization = new Organization(payload());
    expect(organization.deleteAddress('missing')).toBe(false);
    expect(organization.deletePhone('missing')).toBe(false);
    expect(organization.deleteEmail('missing')).toBe(false);
  });

  it('creates new address/phone/email entries with explicit methods', () => {
    expect.hasAssertions();
    const organization = new Organization(payload());
    expect(organization.createAddress({
      email: 'branch@acme.dev',
      type: EAddressType.home,
      isPrimary: false
    })).toBe(true);
    expect(organization.createPhone({
      countryCode: '55',
      localCode: '11',
      number: '123123',
      isPrimary: false
    } as any)).toBe(true);
    expect(organization.createEmail({
      email: 'branch-contact@acme.dev',
      type: EEmailType.personal,
      isPrimary: false
    } as any)).toBe(true);
  });
});
