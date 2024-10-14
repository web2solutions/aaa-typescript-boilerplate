/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/ban-types */
export function Authorize(): Function {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function (...args: any[]) {
      const authorizedUser = await (this as any).authService.authorize(
        args[0].authorization
      );
      (this as any).authService.throwIfUserHasNoAccessToResource(
        authorizedUser,
        args[0].schemaOAS
      );
      // (this as any).authorizedUser = authorizedUser;
      return originalMethod.apply(this, [...args]);
    };
    return descriptor;
  };
}
