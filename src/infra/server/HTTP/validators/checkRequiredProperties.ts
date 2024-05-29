export default function checkRequiredProperties(
  payload: Record<string, any>,
  required: string[]
): boolean {
  const payloadKeyNames = Object.keys(payload);
  for (const name of required) {
    if (payloadKeyNames.indexOf(name) === -1) {
      const error = new Error(`The property ${name} is required.`);
      error.name = 'validation_error';
      throw error;
    }
    if (payload[name] === undefined || payload[name] === null) {
      const error = new Error(`The property ${name} can not be null or undefined.`);
      error.name = 'validation_error';
      throw error;
    }
  }
  return true;
}
