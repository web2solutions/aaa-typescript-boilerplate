import { OpenAPIV3 } from 'openapi-types';
import getSchema from './getSchema';
import isPropertiesMatching from './isPropertiesMatching';
import checkRequiredProperties from './checkRequiredProperties';

export default function validateRequestBody(
  spec: OpenAPIV3.Document,
  endPointConfig: Record<string, any>,
  payload: Record<string, any>
): boolean {
  const { content } = endPointConfig.requestBody;
  const schema = getSchema(spec, content);
  if (schema) {
    // console.log(payload, schema)
    // check for not allowed incoming properties
    isPropertiesMatching(payload, schema.properties);

    // check for required properties
    checkRequiredProperties(payload, schema.required);
  }

  return true;
}
