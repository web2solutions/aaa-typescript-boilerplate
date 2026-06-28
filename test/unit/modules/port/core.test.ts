/* eslint-disable max-classes-per-file, class-methods-use-this, @typescript-eslint/no-unused-vars */
import { _DEFAULT_PAGE_SIZE_ } from '@src/config/constants';
import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { BaseModel } from '@src/modules/port/BaseModel';
import { BaseRepo } from '@src/modules/port/BaseRepo';
import { ServiceResponse } from '@src/modules/port/ServiceResponse';
import { UUID } from '@src/modules/port/UUID';
import { setFilter } from '@src/modules/port/setFilter';
import { setFilterAndPaging } from '@src/modules/port/setFilterAndPaging';
import { setPaging } from '@src/modules/port/setPaging';
import { Context } from '@src/infra/context/Context';

class TestEvent extends BaseDomainEvent<any> {}

class TestModel extends BaseModel<any> {
  constructor(id?: string, public name: string = 'name') {
    super({ id });
  }

  public get label() {
    return this.name;
  }
}

class TestModelWithOwnSerialize extends BaseModel<any> {
  constructor(public value: string = 'v') {
    super();
  }

  public override serialize(): any {
    return super.serialize();
  }
}

class TestRepo extends BaseRepo<any, any, any> {
  public async create(data: any): Promise<any> {
    return data;
  }

  public async update(id: string, data: any): Promise<any> {
    return { id, ...data };
  }

  public async delete(_id: string): Promise<boolean> {
    return true;
  }

  public async getOneById(id: string): Promise<any> {
    return { id };
  }

  public async getAll(
    _filters: Record<string, string | number>,
    _paging: { page: number; size: number }
  ): Promise<any> {
    return {
      result: [], page: 1, size: 1, total: 0
    };
  }
}

describe('port core helpers', () => {
  it('handles uuid create and parse', () => {
    expect.hasAssertions();
    const created = UUID.create().toString();
    expect(typeof created).toBe('string');
    expect(UUID.parse(created).toString()).toBe(created);
    expect(() => UUID.parse('invalid')).toThrow('Invalid UUID');
  });

  it('serializes model and respects excluded properties', () => {
    expect.hasAssertions();
    const model = new TestModel(undefined, 'John');
    model._excludeOnSerialize = ['label'];
    const serialized = model.serialize();
    expect(serialized.id).toBeDefined();
    expect((serialized as any).createdAt).toBeDefined();
    expect((serialized as any).updatedAt).toBeDefined();
    expect((serialized as any).label).toBeUndefined();
  });

  it('serializes model that overrides serialize without leaking method metadata', () => {
    expect.hasAssertions();
    const model = new TestModelWithOwnSerialize('x');
    const serialized = model.serialize();
    expect(serialized.id).toBeDefined();
    expect((serialized as any).createdAt).toBeDefined();
    expect((serialized as any).updatedAt).toBeDefined();
    expect(typeof (serialized as any).serialize).toBe('undefined');
  });

  it('exposes createdAt/updatedAt and allows updating updatedAt', () => {
    expect.hasAssertions();
    const model = new TestModel();
    const nextDate = new Date('2026-01-01T00:00:00.000Z');
    expect(model.createdAt).toBeInstanceOf(Date);
    expect(model.updatedAt).toBeInstanceOf(Date);
    model.updatedAt = nextDate;
    expect(model.updatedAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('builds event metadata and parses string input', () => {
    expect.hasAssertions();
    const event = new TestEvent({
      input: JSON.stringify({ id: '1' }),
      authorization: 'Bearer token',
      entity: 'users',
      action: 'create',
      params: { id: '1' },
      queryString: { page: '2' },
      schemaOAS: { operationId: 'x' },
      metadata: {
        correlationId: 'c', causationId: 'p', timestamp: 1, userId: 'u'
      }
    });
    expect(event.input).toStrictEqual({ id: '1' });
    expect(event.authorization).toBe('Bearer token');
    expect(event.metadata).toStrictEqual({
      correlationId: 'c',
      causationId: 'p',
      timestamp: 1,
      userId: 'u'
    });
  });

  it('loads event metadata defaults from async context store when metadata is missing', () => {
    expect.hasAssertions();
    Context.run(new Map([
      ['correlationId', 'ctx-correlation'],
      ['userId', 'ctx-user']
    ]), () => {
      const event = new TestEvent({
        input: { ok: true }
      } as any);

      expect(event.metadata.correlationId).toBe('ctx-correlation');
      expect(event.metadata.causationId).toBe('ctx-correlation');
      expect(event.metadata.userId).toBe('ctx-user');
      expect(typeof event.metadata.timestamp).toBe('number');
    });
  });

  it('parses filter and paging helpers', () => {
    expect.hasAssertions();
    const event = new TestEvent({
      queryString: {
        filter: Buffer.from(JSON.stringify({ role: 'admin' })).toString('base64'),
        page: '2',
        size: '10'
      }
    });
    expect(setFilter(event)).toStrictEqual({ role: 'admin' });
    expect(setPaging(event)).toStrictEqual({ page: 2, size: 10 });

    const [filter, paging] = setFilterAndPaging(new TestEvent({
      queryString: {
        filter: JSON.stringify({ active: true }),
        page: '3',
        size: '7'
      }
    }));
    expect(filter).toStrictEqual({ active: true });
    expect(paging).toStrictEqual({ page: 3, size: 7 });
  });

  it('handles malformed filter and default paging', () => {
    expect.hasAssertions();
    const malformed = new TestEvent({
      queryString: {
        filter: Buffer.from('not-json').toString('base64')
      }
    });
    expect(setFilter(malformed)).toStrictEqual({});
    expect(setPaging(new TestEvent({ queryString: {} }))).toStrictEqual({
      page: 1,
      size: _DEFAULT_PAGE_SIZE_
    });
  });

  it('initializes base repo and service response', async () => {
    expect.hasAssertions();
    const repo = new TestRepo({ databaseClient: { stores: {} } as any });
    expect(repo.limit).toBe(_DEFAULT_PAGE_SIZE_);
    await expect(repo.delete('1')).resolves.toBe(true);

    const response = new ServiceResponse({ result: true, message: 'ok' });
    expect(response.result).toBe(true);
    expect(response.message).toBe('ok');
  });

  it('validates openapi 3.1 field/data-entity schema contracts', () => {
    expect.hasAssertions();
    expect(() => BaseModel.throwIfFieldSchemaIsNotOpenApi31Compliant({
      name: 'email',
      type: 'string',
      format: 'email',
      validations: ['minLength:3']
    })).not.toThrow();

    expect(() => BaseModel.throwIfFieldSchemaIsNotOpenApi31Compliant({
      name: 'createdAt',
      type: 'datetime',
      format: 'date-time',
      validations: []
    } as any)).toThrow('invalid field type');

    expect(() => BaseModel.throwIfDataEntitySchemaIsNotOpenApi31Compliant({
      name: 'User',
      fields: [{
        name: 'id',
        type: 'string',
        format: 'uuid',
        validations: []
      }]
    })).not.toThrow();

    expect(() => BaseModel.throwIfModelPayloadIsNotOpenApi31Compliant(
      {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'john@example.com'
      },
      {
        name: 'User',
        fields: [
          {
            name: 'id',
            type: 'string',
            format: 'uuid',
            required: true,
            validations: []
          },
          {
            name: 'email',
            type: 'string',
            format: 'email',
            required: true,
            validations: []
          }
        ]
      }
    )).not.toThrow();

    expect(() => BaseModel.throwIfModelPayloadIsNotOpenApi31Compliant(
      {
        id: 'invalid-uuid',
        email: 'john@example.com'
      },
      {
        name: 'User',
        fields: [
          {
            name: 'id',
            type: 'string',
            format: 'uuid',
            required: true,
            validations: []
          },
          {
            name: 'email',
            type: 'string',
            format: 'email',
            required: true,
            validations: []
          }
        ]
      }
    )).toThrow('validation failed');
  });
});
