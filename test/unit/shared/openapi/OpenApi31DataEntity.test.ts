import {
  isOpenApiDataType,
  OPEN_API_31_ALLOWED_TYPES,
  OPEN_API_31_FORMATS_BY_TYPE,
  OPEN_API_31_VALIDATIONS_BY_TYPE,
  throwIfDataEntityIsNotOpenApi31Compliant,
  throwIfFieldDefinitionIsNotOpenApi31Compliant
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
});
