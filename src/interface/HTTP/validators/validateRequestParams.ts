import { ValidationError } from '@src/infra/exceptions';
/**
 * Validate request parameters
 * @param endPointConfig
 * @param requestParams
 */
export default function validateRequestParams(
  endPointConfig: Record<string, any>,
  requestParams: Record<string, any>
): boolean {
  const { parameters } = endPointConfig;
  if (!parameters) return true;
  for (const parameter of parameters) {
    const { name, required } = parameter;
    if (required) {
      // eslint-disable-next-line no-prototype-builtins
      if (!requestParams.hasOwnProperty(name)) {
        throw new ValidationError(`The parameter ${name} is required in the path.`);
      }
    }
    // check empty, check null
    if (requestParams[name].length === 0) {
      throw new ValidationError(`The parameter ${name} can not be empty.`);
    }
    if (requestParams[name].toLowerCase() === 'null') {
      throw new ValidationError(`The parameter ${name} can not be null.`);
    }
  }
  return true;
}
