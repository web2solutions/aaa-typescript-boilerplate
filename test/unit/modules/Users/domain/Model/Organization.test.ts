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
    expect(organization.address).toHaveLength(1);
    expect(organization.phone).toHaveLength(1);
    expect(organization.email).toHaveLength(1);

    const readOnly = new Organization({ ...payload(), readOnly: true });
    expect(() => { readOnly.name = 'New Name'; }).toThrow('read only');
  });
});
