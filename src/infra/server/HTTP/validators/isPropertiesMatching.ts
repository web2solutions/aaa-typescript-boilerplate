export default function isPropertiesMatching(
  payload: Record<string, any>,
  properties: Record<string, any>
): boolean {
  const propertyNames = Object.keys(properties);
  for (const name of Object.keys(payload)) {
    if (propertyNames.indexOf(name) === -1) {
      const error = new Error(`The property ${name} from input payload does not exist inside the domain.`);
      error.name = 'validation_error';
      throw error;
    }
  }
  return true;
}
