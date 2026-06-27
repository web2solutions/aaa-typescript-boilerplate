import { AddressValueObject } from '@src/modules/ddd/valueObjects/AddressValueObject';
import { EAddressType } from '@src/modules/ddd/valueObjects/EAddressType';

describe('address value object', () => {
  it('creates immutable-like primitives and normalizes id', () => {
    expect.hasAssertions();
    const address = new AddressValueObject({
      email: 'hq@acme.dev',
      type: EAddressType.work,
      isPrimary: true
    });
    expect(address.id).toBeDefined();
    expect(address.email).toBe('hq@acme.dev');
    expect(address.type).toBe(EAddressType.work);
    expect(address.isPrimary).toBe(true);
  });

  it('throws for invalid type and missing fields', () => {
    expect.hasAssertions();
    expect(() => new AddressValueObject({
      email: '',
      type: EAddressType.work
    })).toThrow('can not be empty');

    expect(() => new AddressValueObject({
      email: 'hq@acme.dev',
      type: 'invalid'
    })).toThrow('Address type must be one of');
  });
});
