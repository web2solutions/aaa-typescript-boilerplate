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
  it('covers create/update/get/delete/getAll flow', async () => {
    expect.hasAssertions();
    const repository = OrganizationDataRepository.compile({
      databaseClient: InMemoryDbClient
    } as any);
    const created = await repository.create(createPayload());
    expect(created.id).toBeDefined();

    const fetched = await repository.getOneById(created.id);
    expect(fetched.name).toBe(created.name);

    const updated = await repository.update(created.id, {
      id: created.id,
      ...createPayload(),
      name: `${created.name}-updated`
    });
    expect(updated.name).toContain('-updated');

    const page = await repository.getAll({ id: created.id }, { page: 1, size: 10 });
    expect(page.total).toBe(1);

    const deleted = await repository.delete(created.id);
    expect(deleted).toBe(true);
  });
});
