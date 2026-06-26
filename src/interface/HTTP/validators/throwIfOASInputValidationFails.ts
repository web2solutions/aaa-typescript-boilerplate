import { OpenAPIV3 } from 'openapi-types';
import { ValidationError } from '@src/infra/exceptions';
import { validateValueAgainstOpenApiSchema } from '@src/shared/openapi/OpenApi31DataEntity';
import getSchema from './getSchema';

export default function throwIfOASInputValidationFails(
  spec: OpenAPIV3.Document,
  endPointConfig: Record<string, any>,
  payload: unknown
): boolean {
  const requestBody = endPointConfig?.requestBody;
  if (!requestBody) return true;

  const { content, required } = requestBody;
  if ((payload === undefined || payload === null) && required) {
    throw new ValidationError('Request body is required by OpenAPI schema.');
  }

  if (payload === undefined || payload === null) {
    return true;
  }

  const schema = getSchema(spec, content);
  if (schema) {
    try {
      validateValueAgainstOpenApiSchema(payload, schema, spec as unknown as Record<string, any>);
    } catch (error) {
      throw new ValidationError((error as Error).message);
    }
  }

  return true;
}
