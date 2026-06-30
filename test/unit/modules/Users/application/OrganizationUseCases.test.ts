/* eslint-disable jest/max-expects */
import { OrganizationUseCases } from '@src/modules/Users/application/use-cases/OrganizationUseCases';
import { EEmailType } from '@src/modules/ddd/valueObjects';

describe('organization use cases', () => {
  it('delegates all use cases to organization service', async () => {
    expect.hasAssertions();
    const organizationService = {
      create: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      update: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      delete: jest.fn().mockResolvedValue({ result: true }),
      getOneById: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      getAll: jest.fn().mockResolvedValue({ result: [{ id: 'o1' }] }),
      createAddress: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      updateAddress: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      deleteAddress: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      createPhone: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      updatePhone: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      deletePhone: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      createEmail: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      updateEmail: jest.fn().mockResolvedValue({ result: { id: 'o1' } }),
      deleteEmail: jest.fn().mockResolvedValue({ result: { id: 'o1' } })
    };

    const useCases = OrganizationUseCases.compile(organizationService as any);
    expect((await useCases.create({ name: 'Org' } as any)).result?.id).toBe('o1');
    expect((await useCases.update('o1', { id: 'o1', name: 'Org2' } as any)).result?.id).toBe('o1');
    expect((await useCases.delete('o1')).result).toBe(true);
    expect((await useCases.getOneById('o1')).result?.id).toBe('o1');
    expect((await useCases.getAll({}, { page: 1, size: 10 })).result?.[0].id).toBe('o1');
    expect((await useCases.createAddress('o1', { email: 'hq@org.dev', type: 'work' })).result?.id).toBe('o1');
    expect((await useCases.updateAddress('o1', 'a1', { id: 'a1', email: 'new@org.dev' })).result?.id).toBe('o1');
    expect((await useCases.deleteAddress('o1', 'a1')).result?.id).toBe('o1');
    expect((await useCases.createPhone('o1', { countryCode: '55', localCode: '11', number: '9999' })).result?.id).toBe('o1');
    expect((await useCases.updatePhone('o1', 'p1', { id: 'p1', number: '8888' })).result?.id).toBe('o1');
    expect((await useCases.deletePhone('o1', 'p1')).result?.id).toBe('o1');
    expect((await useCases.createEmail('o1', { email: 'contact@org.dev', type: EEmailType.work })).result?.id).toBe('o1');
    expect((await useCases.updateEmail('o1', 'e1', { id: 'e1', email: 'new@org.dev' })).result?.id).toBe('o1');
    expect((await useCases.deleteEmail('o1', 'e1')).result?.id).toBe('o1');
  });
});
