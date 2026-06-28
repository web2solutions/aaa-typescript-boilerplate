/* eslint-disable jest/max-expects */
import { OrganizationDataRepository } from '@src/modules/Users/adapters/out/persistence/OrganizationDataRepository';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { EAddressType, EEmailType } from '@src/modules/ddd/valueObjects';

const createPayload = () => ({
  name: `Org-${Date.now()}-${Math.random()}`,
  address: [{
    email: 'hq@org.dev',
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
    email: 'contact@org.dev',
    type: EEmailType.work,
    isPrimary: true
  }],
  users: []
});

describe('organization data repository', () => {
  it('creates and gets organizations with timestamps', async () => {
    expect.hasAssertions();
    const repository = OrganizationDataRepository.compile({
      databaseClient: InMemoryDbClient
    } as any);
    const created = await repository.create(createPayload());
    expect(created.id).toBeDefined();
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);

    const fetched = await repository.getOneById(created.id);
    expect(fetched.name).toBe(created.name);
  });

  it('updates organizations preserving createdAt and refreshing updatedAt', async () => {
    expect.hasAssertions();
    const repository = OrganizationDataRepository.compile({
      databaseClient: InMemoryDbClient
    } as any);
    const created = await repository.create(createPayload());
    const createdAt = created.createdAt.toISOString();

    const updated = await repository.update(created.id, {
      id: created.id,
      ...createPayload(),
      name: `${created.name}-updated`
    });
    expect(updated.name).toContain('-updated');
    expect(updated.createdAt.toISOString()).toBe(createdAt);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(updated.createdAt.getTime());
  });

  it('gets paged results and deletes organizations', async () => {
    expect.hasAssertions();
    const repository = OrganizationDataRepository.compile({
      databaseClient: InMemoryDbClient
    } as any);
    const created = await repository.create(createPayload());
    const page = await repository.getAll({ id: created.id }, { page: 1, size: 10 });
    expect(page.total).toBe(1);
    const deleted = await repository.delete(created.id);
    expect(deleted).toBe(true);
  });

  it('supports explicit address/phone/email mutation methods', async () => {
    expect.hasAssertions();
    const repository = OrganizationDataRepository.compile({
      databaseClient: InMemoryDbClient
    } as any);
    const created = await repository.create(createPayload());
    const createdAddressId = created.address[0].id;
    const createdPhoneId = created.phone[0].id;
    const createdEmailId = created.email[0].id;

    const withAddress = await repository.createAddress(created.id, {
      email: 'branch@org.dev',
      type: EAddressType.home,
      isPrimary: false
    });
    expect(withAddress.address).toHaveLength(2);

    const withUpdatedAddress = await repository.updateAddress(created.id, createdAddressId, {
      id: createdAddressId,
      email: 'hq2@org.dev',
      type: EAddressType.vacation
    });
    expect(withUpdatedAddress.address.find((x: any) => x.id === createdAddressId)?.email).toBe('hq2@org.dev');

    const withDeletedAddress = await repository.deleteAddress(created.id, createdAddressId);
    expect(withDeletedAddress.address.find((x: any) => x.id === createdAddressId)).toBeUndefined();

    const withPhone = await repository.createPhone(created.id, {
      countryCode: '1',
      localCode: '305',
      number: '7777777',
      isPrimary: false
    });
    expect(withPhone.phone).toHaveLength(2);

    const withUpdatedPhone = await repository.updatePhone(created.id, createdPhoneId, {
      id: createdPhoneId,
      number: '1111111'
    });
    expect(withUpdatedPhone.phone.find((x: any) => x.id === createdPhoneId)?.number).toBe('1111111');

    const withDeletedPhone = await repository.deletePhone(created.id, createdPhoneId);
    expect(withDeletedPhone.phone.find((x: any) => x.id === createdPhoneId)).toBeUndefined();

    const withEmail = await repository.createEmail(created.id, {
      email: 'billing@org.dev',
      type: EEmailType.work,
      isPrimary: false
    });
    expect(withEmail.email).toHaveLength(2);

    const withUpdatedEmail = await repository.updateEmail(created.id, createdEmailId, {
      id: createdEmailId,
      email: 'contact-updated@org.dev'
    });
    expect(withUpdatedEmail.email.find((x: any) => x.id === createdEmailId)?.email).toBe('contact-updated@org.dev');

    const withDeletedEmail = await repository.deleteEmail(created.id, createdEmailId);
    expect(withDeletedEmail.email.find((x: any) => x.id === createdEmailId)).toBeUndefined();
  });
});
