import { IEventBus } from '@src/modules/port/IEventBus';
import { IUserEventListeners } from '@src/modules/Users/events/contracts/IUserEventListeners';
import { UserIntegrationEventName } from '@src/modules/Users/events/contracts/UserIntegrationEventName';

const noop = async () => undefined;

export const registerUserEventListeners = (
  eventBus: IEventBus,
  listeners?: IUserEventListeners
): void => {
  const safeListeners: Required<IUserEventListeners> = {
    onUserCreated: listeners?.onUserCreated ?? noop,
    onUserUpdated: listeners?.onUserUpdated ?? noop,
    onUserDeleted: listeners?.onUserDeleted ?? noop,
    onUserPasswordUpdated: listeners?.onUserPasswordUpdated ?? noop
  };

  eventBus.subscribe(UserIntegrationEventName.Created, safeListeners.onUserCreated);
  eventBus.subscribe(UserIntegrationEventName.Updated, safeListeners.onUserUpdated);
  eventBus.subscribe(UserIntegrationEventName.Deleted, safeListeners.onUserDeleted);
  eventBus.subscribe(
    UserIntegrationEventName.PasswordUpdated,
    safeListeners.onUserPasswordUpdated
  );
};
