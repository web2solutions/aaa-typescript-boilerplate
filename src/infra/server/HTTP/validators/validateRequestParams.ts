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
        const error = new Error(`The parameter ${name} is required in the path.`);
        error.name = 'validation_error';
        throw error;
      }
    }
    // check empty, check null
    if (requestParams[name].length === 0) {
      const error = new Error(`The parameter ${name} can not be empty.`);
      error.name = 'validation_error';
      throw error;
    }
    if (requestParams[name].toLowerCase() === 'null') {
      const error = new Error(`The parameter ${name} can not be null.`);
      error.name = 'validation_error';
      throw error;
    }
  }
  return true;
}
