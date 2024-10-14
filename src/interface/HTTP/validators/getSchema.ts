import { OpenAPIV3 } from 'openapi-types';

export default function getSchema(
  spec: OpenAPIV3.Document,
  content: Record<string, any>
): Record<string, any> | undefined {
  // console.log(spec);
  const keyName = Object.keys(content)[0];
  const schemaPath = content[keyName].schema.$ref;
  const schemaPathArray = schemaPath.split('/');
  const schemaName = schemaPathArray[schemaPathArray.length - 1];
  if (spec.components) {
    if (spec.components.schemas) {
      if (spec.components.schemas[schemaName]) {
        return spec.components.schemas[schemaName];
      }
    }
  }

  return undefined;
}
