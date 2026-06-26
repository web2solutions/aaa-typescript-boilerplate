import { OrganizationUseCases } from '@src/modules/Users/application/use-cases/OrganizationUseCases';

describe('organization use cases', () => {
  it('delegates all use cases to organization service', async () => {
    expect.hasAssertions();
    const organizationService = {
      create: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      update: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      delete: jest.fn().mockResolvedValue({ result: true }),
      getOneById: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      getAll: jest.fn().mockResolvedValue({ result: [{ id: 'o1' }] })
    };

    const useCases = OrganizationUseCases.compile(organizationService as any);
    expect((await useCases.create({ name: 'Org' } as any)).result?.id).toBe('o1');
    expect((await useCases.update('o1', { id: 'o1', name: 'Org2' } as any)).result?.id).toBe('o1');
    expect((await useCases.delete('o1')).result).toBe(true);
    expect((await useCases.getOneById('o1')).result?.id).toBe('o1');
    expect((await useCases.getAll({}, { page: 1, size: 10 })).result?.[0].id).toBe('o1');
  });
});
