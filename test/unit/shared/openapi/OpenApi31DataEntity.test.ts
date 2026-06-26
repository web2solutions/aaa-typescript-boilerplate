import {
  isOpenApiDataType,
  OPEN_API_31_ALLOWED_TYPES,
  OPEN_API_31_FORMATS_BY_TYPE,
  OPEN_API_31_VALIDATIONS_BY_TYPE,
  mapDataEntityToOpenApiSchema,
  throwIfDataEntityIsNotOpenApi31Compliant,
  throwIfFieldDefinitionIsNotOpenApi31Compliant,
  validateValueAgainstOpenApiSchema
} from '@src/shared/openapi/OpenApi31DataEntity';

describe('openapi 3.1 data-entity helpers', () => {
  it('exposes allowed type/format/validation registries', () => {
    expect.hasAssertions();
    expect(OPEN_API_31_ALLOWED_TYPES).toStrictEqual([
      'string',
      'number',
      'integer',
      'boolean',
      'array',
      'object'
    ]);
    expect(OPEN_API_31_FORMATS_BY_TYPE.string).toContain('email');
    expect(OPEN_API_31_FORMATS_BY_TYPE.integer).toContain('int64');
    expect(OPEN_API_31_VALIDATIONS_BY_TYPE.string).toContain('pattern');
    expect(OPEN_API_31_VALIDATIONS_BY_TYPE.array).toContain('uniqueItems');
  });

  it('recognizes openapi data types', () => {
    expect.hasAssertions();
    expect(isOpenApiDataType('string')).toBe(true);
    expect(isOpenApiDataType('uuid')).toBe(false);
  });

  it('validates compliant field definitions', () => {
    expect.hasAssertions();
    expect(() => throwIfFieldDefinitionIsNotOpenApi31Compliant({
      name: 'email',
      type: 'string',
      format: 'email',
      validations: ['minLength:3', 'pattern:^.+@.+$']
    })).not.toThrow();
  });

  it('rejects invalid field definitions', () => {
    expect.hasAssertions();
    expect(() => throwIfFieldDefinitionIsNotOpenApi31Compliant({
      name: '',
      type: 'string',
      format: 'email',
      validations: []
    })).toThrow('field name is required');

    expect(() => throwIfFieldDefinitionIsNotOpenApi31Compliant({
      name: 'createdAt',
      type: 'datetime',
      format: 'date-time',
      validations: []
    })).toThrow('invalid field type');

    expect(() => throwIfFieldDefinitionIsNotOpenApi31Compliant({
      name: 'createdAt',
      type: 'string',
      format: 'int64',
      validations: []
    })).toThrow('invalid format');

    expect(() => throwIfFieldDefinitionIsNotOpenApi31Compliant({
      name: 'active',
      type: 'boolean',
      format: 'none',
      validations: ['minLength:1']
    })).toThrow('invalid validation');
  });

  it('validates compliant data entities and rejects invalid ones', () => {
    expect.hasAssertions();
    expect(() => throwIfDataEntityIsNotOpenApi31Compliant({
      name: 'User',
      fields: [
        {
          name: 'id',
          type: 'string',
          format: 'uuid',
          validations: ['pattern:^[0-9a-fA-F-]{36}$']
        },
        {
          name: 'active',
          type: 'boolean',
          format: 'none',
          validations: []
        }
      ]
    })).not.toThrow();

    expect(() => throwIfDataEntityIsNotOpenApi31Compliant({
      name: '',
      fields: []
    })).toThrow('entity name is required');
  });

  it('maps data entity to openapi schema and validates payload', () => {
    expect.hasAssertions();
    const schema = mapDataEntityToOpenApiSchema({
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
          name: 'age',
          type: 'integer',
          required: false,
          validations: ['minimum:18']
        }
      ]
    });

    expect(schema.required).toStrictEqual(['id']);
    expect(() => validateValueAgainstOpenApiSchema(
      {
        id: '00000000-0000-4000-8000-000000000111',
        age: 18
      },
      schema,
      { components: { schemas: {} } }
    )).not.toThrow();

    expect(() => validateValueAgainstOpenApiSchema(
      {
        id: 'invalid',
        age: 10
      },
      schema,
      { components: { schemas: {} } }
    )).toThrow('validation failed');
  });

  const buildAdvancedSpec = (): any => ({
    components: {
      schemas: {
        Email: {
          type: 'string',
          format: 'email'
        },
        Profile: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 2 },
            age: { type: 'integer', minimum: 18, multipleOf: 1 }
          },
          additionalProperties: false
        },
        TagList: {
          type: 'array',
          minItems: 1,
          uniqueItems: true,
          items: { type: 'string', minLength: 1 }
        }
      }
    }
  });

  it('validates refs for email/profile/taglist schemas', () => {
    expect.hasAssertions();
    const spec = buildAdvancedSpec();

    expect(() => validateValueAgainstOpenApiSchema(
      'john@example.com',
      { $ref: '#/components/schemas/Email' },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      'wrong-email',
      { $ref: '#/components/schemas/Email' },
      spec
    )).toThrow('email format');
    expect(() => validateValueAgainstOpenApiSchema(
      { name: 'John', age: 20 },
      { $ref: '#/components/schemas/Profile' },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      { name: 'J', age: 17, unknown: true },
      { $ref: '#/components/schemas/Profile' },
      spec
    )).toThrow('minLength');
    expect(() => validateValueAgainstOpenApiSchema(
      ['a', 'a'],
      { $ref: '#/components/schemas/TagList' },
      spec
    )).toThrow('uniqueItems');
  });

  it('validates composition and nullable success scenarios', () => {
    expect.hasAssertions();
    const spec = buildAdvancedSpec();

    expect(() => validateValueAgainstOpenApiSchema(
      ['a', 'b'],
      { $ref: '#/components/schemas/TagList' },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      null,
      { type: ['null', 'string'] },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      'ok',
      { oneOf: [{ type: 'number' }, { type: 'string', minLength: 2 }] },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      true,
      { anyOf: [{ type: 'boolean' }, { type: 'integer' }] },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      12,
      { allOf: [{ type: 'integer', minimum: 10 }, { type: 'integer', maximum: 20 }] },
      spec
    )).not.toThrow();
  });

  it('validates success scenarios for string formats', () => {
    expect.hasAssertions();
    const spec = buildAdvancedSpec();

    expect(() => validateValueAgainstOpenApiSchema(
      '2026-01-01',
      { type: 'string', format: 'date' },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      '2026-01-01T10:30:00.000Z',
      { type: 'string', format: 'date-time' },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      'http://localhost:3000',
      { type: 'string', format: 'uri' },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      '127.0.0.1',
      { type: 'string', format: 'ipv4' },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      '2001:db8::1',
      { type: 'string', format: 'ipv6' },
      spec
    )).not.toThrow();
  });

  it('validates regex format success scenario', () => {
    expect.hasAssertions();
    const spec = buildAdvancedSpec();
    expect(() => validateValueAgainstOpenApiSchema(
      '^abc$',
      { type: 'string', format: 'regex' },
      spec
    )).not.toThrow();
  });

  it('throws on invalid refs, enum mismatch and numeric boundaries', () => {
    expect.hasAssertions();
    const spec = { components: { schemas: {} } } as any;

    expect(() => validateValueAgainstOpenApiSchema(
      'x',
      { $ref: '#/components/schemas/Missing' },
      spec
    )).toThrow('could not be resolved');

    expect(() => validateValueAgainstOpenApiSchema(
      'x',
      { type: 'string', enum: ['a', 'b'] },
      spec
    )).toThrow('must be one of');

    expect(() => validateValueAgainstOpenApiSchema(
      4,
      { type: 'number', exclusiveMinimum: 4 },
      spec
    )).toThrow('exclusiveMinimum');

    expect(() => validateValueAgainstOpenApiSchema(
      6,
      { type: 'number', exclusiveMaximum: 6 },
      spec
    )).toThrow('exclusiveMaximum');

    expect(() => validateValueAgainstOpenApiSchema(
      7,
      { type: 'number', multipleOf: 2 },
      spec
    )).toThrow('multipleOf');
  });

  it('throws on array minItems boundary', () => {
    expect.hasAssertions();
    const spec = { components: { schemas: {} } } as any;
    expect(() => validateValueAgainstOpenApiSchema(
      [],
      { type: 'array', minItems: 1 },
      spec
    )).toThrow('minItems');
  });

  it('covers primitive type mismatch branches', () => {
    expect.hasAssertions();
    const spec = { components: { schemas: {} } } as any;

    expect(() => validateValueAgainstOpenApiSchema(null, { type: 'string' }, spec))
      .toThrow('null is not allowed');
    expect(() => validateValueAgainstOpenApiSchema(1, { type: 'string' }, spec))
      .toThrow('expected one of');
    expect(() => validateValueAgainstOpenApiSchema('x', { type: 'number' }, spec))
      .toThrow('expected one of');
    expect(() => validateValueAgainstOpenApiSchema(1.2, { type: 'integer' }, spec))
      .toThrow('expected one of [integer]');
    expect(() => validateValueAgainstOpenApiSchema('true', { type: 'boolean' }, spec))
      .toThrow('expected one of');
  });

  it('covers array/object primitive mismatch branches', () => {
    expect.hasAssertions();
    const spec = { components: { schemas: {} } } as any;

    expect(() => validateValueAgainstOpenApiSchema('true', { type: 'boolean' }, spec))
      .toThrow('expected one of');
    expect(() => validateValueAgainstOpenApiSchema({}, { type: 'array' }, spec))
      .toThrow('expected one of');
    expect(() => validateValueAgainstOpenApiSchema([], { type: 'object' }, spec))
      .toThrow('expected one of');
  });

  it('covers string length/pattern constraint branches', () => {
    expect.hasAssertions();
    const spec = { components: { schemas: {} } } as any;

    expect(() => validateValueAgainstOpenApiSchema('12345', {
      type: 'string',
      maxLength: 2
    }, spec)).toThrow('maxLength');

    expect(() => validateValueAgainstOpenApiSchema('abc', {
      type: 'string',
      pattern: '^xyz$'
    }, spec)).toThrow('pattern');
  });

  it('covers invalid date/date-time/email format branches', () => {
    expect.hasAssertions();
    const spec = { components: { schemas: {} } } as any;

    expect(() => validateValueAgainstOpenApiSchema('20260101', {
      type: 'string',
      format: 'date'
    }, spec)).toThrow('expected date format');
    expect(() => validateValueAgainstOpenApiSchema('not-date-time', {
      type: 'string',
      format: 'date-time'
    }, spec)).toThrow('expected date-time format');
    expect(() => validateValueAgainstOpenApiSchema('invalid-email', {
      type: 'string',
      format: 'email'
    }, spec)).toThrow('expected email format');
  });

  it('covers invalid uuid/uri/ip/regex format branches', () => {
    expect.hasAssertions();
    const spec = { components: { schemas: {} } } as any;

    expect(() => validateValueAgainstOpenApiSchema('invalid-uuid', {
      type: 'string',
      format: 'uuid'
    }, spec)).toThrow('expected uuid format');
    expect(() => validateValueAgainstOpenApiSchema('not uri', {
      type: 'string',
      format: 'uri'
    }, spec)).toThrow('expected uri format');
    expect(() => validateValueAgainstOpenApiSchema('300.1.1.1', {
      type: 'string',
      format: 'ipv4'
    }, spec)).toThrow('expected ipv4 format');
    expect(() => validateValueAgainstOpenApiSchema('xyz', {
      type: 'string',
      format: 'ipv6'
    }, spec)).toThrow('expected ipv6 format');
    expect(() => validateValueAgainstOpenApiSchema('[', {
      type: 'string',
      format: 'regex'
    }, spec)).toThrow('expected regex pattern');
  });

  it('covers composition and object boundary branches', () => {
    expect.hasAssertions();
    const spec = { components: { schemas: {} } } as any;

    expect(() => validateValueAgainstOpenApiSchema('x', {
      oneOf: [{ type: 'number' }, { type: 'boolean' }]
    }, spec)).toThrow('oneOf');
    expect(() => validateValueAgainstOpenApiSchema('x', {
      anyOf: [{ type: 'number' }, { type: 'boolean' }]
    }, spec)).toThrow('anyOf');

    expect(() => validateValueAgainstOpenApiSchema(
      { a: 1 },
      {
        type: 'object',
        minProperties: 2,
        properties: { a: { type: 'number' } }
      },
      spec
    )).toThrow('minProperties');

    expect(() => validateValueAgainstOpenApiSchema(
      { a: 1, b: 2 },
      {
        type: 'object',
        maxProperties: 1,
        properties: { a: { type: 'number' } }
      },
      spec
    )).toThrow('maxProperties');

    expect(() => validateValueAgainstOpenApiSchema(
      { known: 1, extra: 'x' },
      {
        type: 'object',
        properties: { known: { type: 'number' } },
        additionalProperties: false
      },
      spec
    )).toThrow('not allowed');
  });

  it('covers additionalProperties object and maxItems branches', () => {
    expect.hasAssertions();
    const spec = { components: { schemas: {} } } as any;

    expect(() => validateValueAgainstOpenApiSchema(
      { known: 1, extra: 'x' },
      {
        type: 'object',
        properties: { known: { type: 'number' } },
        additionalProperties: { type: 'string' }
      },
      spec
    )).not.toThrow();
    expect(() => validateValueAgainstOpenApiSchema(
      ['a', 'b', 'c'],
      { type: 'array', maxItems: 2 },
      spec
    )).toThrow('maxItems');
  });

  it('covers data-entity mapping branches for enum parsing and required flag validation', () => {
    expect.hasAssertions();
    const schema = mapDataEntityToOpenApiSchema({
      name: 'Feature',
      fields: [
        {
          name: 'enabled',
          type: 'boolean',
          required: true,
          validations: []
        },
        {
          name: 'tags',
          type: 'string',
          validations: ['enum:a|b|c']
        },
        {
          name: 'fallbackEnum',
          type: 'string',
          validations: ['enum:[invalid-json']
        },
        {
          name: 'ratio',
          type: 'number',
          validations: ['minimum:0.1']
        }
      ]
    });

    expect(schema.properties.tags.enum).toStrictEqual(['a', 'b', 'c']);
    expect(schema.properties.fallbackEnum.enum).toStrictEqual(['[invalid-json']);
    expect(schema.properties.ratio.minimum).toBe(0.1);

    expect(() => throwIfFieldDefinitionIsNotOpenApi31Compliant({
      name: 'enabled',
      type: 'boolean',
      required: 'yes' as any,
      validations: []
    })).toThrow('invalid required flag');

    expect(() => validateValueAgainstOpenApiSchema(
      {
        enabled: true,
        tags: 'a',
        fallbackEnum: '[invalid-json',
        ratio: 0.5
      },
      schema,
      { components: { schemas: {} } }
    )).not.toThrow();
  });

  it('covers ref and validation parsing edge branches', () => {
    expect.hasAssertions();
    const spec = {
      components: {
        schemas: {
          StringSchema: { type: 'string' }
        }
      }
    } as any;

    expect(() => validateValueAgainstOpenApiSchema(
      'x',
      { $ref: '#/components/schemas/StringSchema/type' },
      spec
    )).toThrow('could not be resolved');
    expect(() => validateValueAgainstOpenApiSchema(
      'x',
      { $ref: '#/components/schemas/StringSchema/type/extra' },
      spec
    )).toThrow('could not be resolved');

    const mapped = mapDataEntityToOpenApiSchema({
      name: 'Config',
      fields: [
        {
          name: 'options',
          type: 'string',
          validations: ['enum:[invalid-json]']
        },
        {
          name: 'csv',
          type: 'string',
          validations: ['enum:a,b,c']
        },
        {
          name: 'limit',
          type: 'number',
          validations: ['maximum:10']
        }
      ]
    });

    expect(mapped.properties.options.enum).toStrictEqual(['[invalid-json]']);
    expect(mapped.properties.csv.enum).toStrictEqual(['a', 'b', 'c']);
    expect(() => validateValueAgainstOpenApiSchema(
      { options: '[invalid-json]', csv: 'a', limit: 12 },
      mapped,
      { components: { schemas: {} } }
    )).toThrow('maximum');
  });
});
