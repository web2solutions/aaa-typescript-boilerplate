import {
  IMessageMediator,
  IMessage
} from '@src/modules/port';
import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';
import { UserMessageContracts } from '@src/modules/Users/events/contracts/UserMessageContracts';

interface IAuthorizePayload {
  authorization: string;
}

interface IEnsureAccessPayload extends IAuthorizePayload {
  schemaOAS: Record<string, any>;
}

export const registerUserMessageHandlers = (
  messageMediator: IMessageMediator,
  authService: IAuthService
): void => {
  messageMediator.registerHandler<IAuthorizePayload, Record<string, any>>(
    UserMessageContracts.Authorize,
    async (message: IMessage<IAuthorizePayload>) => {
      try {
        const result = await authService.authorize(message.payload.authorization);
        return {
          contract: message.contract,
          version: message.version,
          result
        };
      } catch (error) {
        return {
          contract: message.contract,
          version: message.version,
          error: error as Error
        };
      }
    }
  );

  messageMediator.registerHandler<IEnsureAccessPayload, Record<string, any>>(
    UserMessageContracts.EnsureAccess,
    async (message: IMessage<IEnsureAccessPayload>) => {
      try {
        const user = await authService.authorize(message.payload.authorization);
        authService.throwIfUserHasNoAccessToResource(user as any, message.payload.schemaOAS);
        return {
          contract: message.contract,
          version: message.version,
          result: user as Record<string, any>
        };
      } catch (error) {
        return {
          contract: message.contract,
          version: message.version,
          error: error as Error
        };
      }
    }
  );
};
