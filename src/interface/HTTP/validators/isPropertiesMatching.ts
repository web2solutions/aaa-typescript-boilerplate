import { ValidationError } from '@src/infra/exceptions';
/**
 * Check if properties exists in payload
 *
 * @param payload - The payload to check
 * @param properties - The properties to check
 * @returns True if properties exists in payload
 */
export default function isPropertiesMatching(
  payload: Record<string, any>,
  properties: Record<string, any>
): boolean {
  const propertyNames = Object.keys(properties);
  for (const name of Object.keys(payload)) {
    if (propertyNames.indexOf(name) === -1) {
      throw new ValidationError(`The property ${name} from input payload does not exist.`);
    }
  }
  return true;
}
