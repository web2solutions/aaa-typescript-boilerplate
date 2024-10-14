import { ValidationError } from '@src/infra/exceptions';
/**
 * Checks if the payload contains all the required properties
 * @param payload the payload to check
 * @param required the required properties
 * @returns true if the payload contains all the required properties
 */
export default function checkRequiredProperties(
  payload: Record<string, any>,
  required: string[]
): boolean {
  const payloadKeyNames = Object.keys(payload);
  for (const name of required) {
    if (payloadKeyNames.indexOf(name) === -1) {
      throw new ValidationError(`The property ${name} is required.`);
    }
    if (payload[name] === undefined || payload[name] === null) {
      throw new ValidationError(`The property ${name} can not be null or undefined.`);
    }
  }
  return true;
}
