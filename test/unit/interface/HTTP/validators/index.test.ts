import { ValidationError } from '@src/infra/exceptions';
import checkRequiredProperties from '@src/interface/HTTP/validators/checkRequiredProperties';
import getSchema from '@src/interface/HTTP/validators/getSchema';
import isPropertiesMatching from '@src/interface/HTTP/validators/isPropertiesMatching';
import throwIfOASInputValidationFails from '@src/interface/HTTP/validators/throwIfOASInputValidationFails';
import validateRequestParams from '@src/interface/HTTP/validators/validateRequestParams';

describe('http validators', () => {
  it('validates required properties', () => {
    expect.hasAssertions();
    expect(checkRequiredProperties({ id: '1' }, ['id'])).toBe(true);
    expect(() => checkRequiredProperties({}, ['id'])).toThrow(ValidationError);
    expect(() => checkRequiredProperties({ id: null }, ['id'])).toThrow(ValidationError);
  });

  it('checks payload properties against schema properties', () => {
    expect.hasAssertions();
    expect(isPropertiesMatching({ id: 1 }, { id: { type: 'string' } })).toBe(true);
    expect(() => isPropertiesMatching({ unknown: true }, { id: { type: 'string' } })).toThrow(
      ValidationError
    );
  });

  it('gets schema from oas content ref', () => {
    expect.hasAssertions();
    const spec = {
      components: {
        schemas: {
          RequestCreateUser: {
            properties: { firstName: { type: 'string' } },
            required: ['firstName']
          }
        }
      }
    } as any;
    const content = {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/RequestCreateUser'
        }
      }
    };

    expect(getSchema(spec, content)?.required).toStrictEqual(['firstName']);
    expect(getSchema({} as any, content)).toBeUndefined();
  });

  it('validates payload against endpoint request body schema', () => {
    expect.hasAssertions();
    const spec = {
      components: {
        schemas: {
          RequestCreateUser: {
            properties: { firstName: { type: 'string' } },
            required: ['firstName']
          }
        }
      }
    } as any;
    const endPointConfig = {
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RequestCreateUser'
            }
          }
        }
      }
    };

    expect(throwIfOASInputValidationFails(spec, endPointConfig, { firstName: 'John' })).toBe(true);
    expect(() => throwIfOASInputValidationFails(spec, endPointConfig, {})).toThrow(ValidationError);
  });

  it('validates request path params', () => {
    expect.hasAssertions();
    const endPointConfig = {
      parameters: [{ name: 'id', required: true }]
    };
    expect(validateRequestParams(endPointConfig, { id: '1' })).toBe(true);
    expect(validateRequestParams({}, {})).toBe(true);
    expect(() => validateRequestParams(endPointConfig, {} as any)).toThrow(ValidationError);
    expect(() => validateRequestParams(endPointConfig, { id: '' })).toThrow(ValidationError);
    expect(() => validateRequestParams(endPointConfig, { id: 'null' })).toThrow(ValidationError);
  });
});
