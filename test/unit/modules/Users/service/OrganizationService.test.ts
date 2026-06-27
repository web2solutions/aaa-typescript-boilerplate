import { OrganizationService } from '@src/modules/Users/service/OrganizationService';

const setup = () => {
  const dataRepository = {
    create: jest.fn().mockResolvedValue({ id: 'o1', name: 'Org' }),
    update: jest.fn().mockResolvedValue({ id: 'o1', name: 'Org Updated' }),
    delete: jest.fn().mockResolvedValue(true),
    getOneById: jest.fn().mockResolvedValue({ id: 'o1', name: 'Org' }),
    getAll: jest.fn().mockResolvedValue({
      page: 1,
      size: 10,
      total: 1,
      result: [{ id: 'o1', name: 'Org' }]
    })
  };
  const service = OrganizationService.compile({ dataRepository } as any);
  return { service, dataRepository };
};

describe('organization service', () => {
  it('delegates CRUD operations to repository', async () => {
    expect.hasAssertions();
    const { service } = setup();
    expect((await service.create({ name: 'Org' } as any)).result?.id).toBe('o1');
    expect((await service.update('o1', { id: 'o1', name: 'Org Updated' } as any)).result?.name).toBe('Org Updated');
    expect((await service.getOneById('o1')).result?.id).toBe('o1');
  });

  it('delegates paging and deletion operations', async () => {
    expect.hasAssertions();
    const { service, dataRepository } = setup();
    await service.create({ name: 'Org' } as any);
    expect((await service.getAll({}, { page: 1, size: 10 })).result?.[0].id).toBe('o1');
    expect((await service.delete('o1')).result).toBe(true);
    expect(dataRepository.create).toHaveBeenCalledWith({ name: 'Org' });
  });

  it('returns service errors when repository fails', async () => {
    expect.hasAssertions();
    const { service, dataRepository } = setup();
    dataRepository.create.mockRejectedValueOnce(new Error('boom'));
    const response = await service.create({ name: 'Org' } as any);
    expect(response.error).toBeDefined();
  });

  it('covers error branches for remaining CRUD methods', async () => {
    expect.hasAssertions();
    const { service, dataRepository } = setup();

    dataRepository.update.mockRejectedValueOnce(new Error('update-fail'));
    dataRepository.delete.mockRejectedValueOnce(new Error('delete-fail'));
    dataRepository.getOneById.mockRejectedValueOnce(new Error('get-fail'));
    dataRepository.getAll.mockRejectedValueOnce(new Error('get-all-fail'));

    expect((await service.update('o1', { name: 'x' } as any)).error?.message).toBe('update-fail');
    expect((await service.delete('o1')).error?.message).toBe('delete-fail');
    expect((await service.getOneById('o1')).error?.message).toBe('get-fail');
    expect((await service.getAll({}, { page: 1, size: 10 })).error?.message).toBe('get-all-fail');
  });
});
