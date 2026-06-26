import { ValidationError } from '@src/infra/exceptions';
import { validateValueAgainstOpenApiSchema } from '@src/shared/openapi/OpenApi31DataEntity';
/**
 * Validate request parameters
 * @param endPointConfig
 * @param requestParams
 */
export default function validateRequestParams(
  endPointConfig: Record<string, any>,
  requestParams: Record<string, any>,
  queryString: Record<string, any> = {},
  headers: Record<string, any> = {}
): boolean {
  const { parameters } = endPointConfig;
  if (!parameters) return true;
  for (const parameter of parameters) {
    const {
      name,
      required,
      schema = {},
      in: location = 'path'
    } = parameter;
    let source = requestParams;
    if (location === 'query') {
      source = queryString;
    } else if (location === 'header') {
      source = headers;
    }
    const value = source?.[name];

    if (required) {
      if (value === undefined || value === null || value === '') {
        throw new ValidationError(`The parameter ${name} is required in ${location}.`);
      }
    }

    if (value !== undefined && value !== null) {
      if (typeof value === 'string' && value.length === 0) {
        throw new ValidationError(`The parameter ${name} can not be empty.`);
      }
      if (typeof value === 'string' && value.toLowerCase() === 'null') {
        throw new ValidationError(`The parameter ${name} can not be null.`);
      }

      try {
        validateValueAgainstOpenApiSchema(
          value,
          schema,
          { components: { schemas: {} } },
          `params.${name}`
        );
      } catch (error) {
        throw new ValidationError((error as Error).message);
      }
    }
  }
  return true;
}
