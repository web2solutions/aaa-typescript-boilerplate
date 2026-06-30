import {
  BaseService,
  IServiceResponse
} from '@src/modules/port';

interface TestRecord {
  id: string;
}

class TestService extends BaseService<TestRecord, TestRecord, TestRecord> {
  public async create(data: TestRecord): Promise<IServiceResponse<TestRecord>> {
    this.services.create = true;
    return { result: data };
  }

  public async update(id: string, data: TestRecord): Promise<IServiceResponse<TestRecord>> {
    this.services.update = true;
    return { result: { ...data, id } };
  }

  public async delete(): Promise<IServiceResponse<boolean>> {
    this.services.delete = true;
    return { result: true };
  }

  public async getOneById(id: string): Promise<IServiceResponse<TestRecord>> {
    this.services.getOneById = true;
    return { result: { id } };
  }

  public async getAll(): Promise<IServiceResponse<TestRecord[]>> {
    this.services.getAll = true;
    return { result: [] };
  }
}

describe('base service', () => {
  it('wires repos and services independently from config', () => {
    expect.hasAssertions();
    const dataRepository = {} as never;
    const repos = { auditRepository: { name: 'audit' } };
    const services = { cryptoService: { name: 'crypto' } };

    const service = new TestService({
      dataRepository,
      repos,
      services
    });

    expect(service.repos).toBe(repos);
    expect(service.services).toBe(services);
  });

  it('throws when data repository is missing', () => {
    expect.hasAssertions();
    expect(() => new TestService({} as any)).toThrow(
      'You must provide a data repository when creating a service instance.'
    );
  });
});
