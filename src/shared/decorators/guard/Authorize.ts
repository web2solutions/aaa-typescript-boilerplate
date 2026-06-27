/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/ban-types */
import { UserMessageContracts } from '@src/modules/Users/events/contracts/UserMessageContracts';

export function Authorize(): Function {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function (...args: any[]) {
      const [event] = args;
      const { messageMediator, authService } = this as any;
      if (messageMediator?.request) {
        const { error } = await messageMediator.request({
          contract: UserMessageContracts.EnsureAccess,
          payload: {
            authorization: event.authorization,
            schemaOAS: event.schemaOAS
          }
        });
        if (error) {
          throw error;
        }
      } else {
        const authorizedUser = await authService.authorize(
          event.authorization
        );
        authService.throwIfUserHasNoAccessToResource(
          authorizedUser,
          event.schemaOAS
        );
      }
      // (this as any).authorizedUser = authorizedUser;
      return originalMethod.apply(this, [...args]);
    };
    return descriptor;
  };
}
