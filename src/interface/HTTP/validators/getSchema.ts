import { OpenAPIV3 } from 'openapi-types';

const resolveRef = (
  spec: OpenAPIV3.Document,
  ref: string
): Record<string, any> | undefined => {
  if (!ref.startsWith('#/')) return undefined;
  const path = ref.slice(2).split('/');
  let current: any = spec;
  for (const entry of path) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[entry];
  }
  return current as Record<string, any> | undefined;
};

export default function getSchema(
  spec: OpenAPIV3.Document,
  content: Record<string, any>
): Record<string, any> | undefined {
  const keyName = Object.keys(content || {})[0];
  if (!keyName) return undefined;

  const schema = content[keyName]?.schema;
  if (!schema) return undefined;

  if (schema.$ref && typeof schema.$ref === 'string') {
    return resolveRef(spec, schema.$ref);
  }

  return schema as Record<string, any>;
}
