import { IIntegrationEvent } from '@src/modules/port/IIntegrationEvent';

export interface IUserEventListeners {
  onUserCreated?(event: IIntegrationEvent): Promise<void> | void;
  onUserUpdated?(event: IIntegrationEvent): Promise<void> | void;
  onUserDeleted?(event: IIntegrationEvent): Promise<void> | void;
  onUserPasswordUpdated?(event: IIntegrationEvent): Promise<void> | void;
}
