import { InMemoryEventBus } from '@src/infra/events/InMemoryEventBus';
import { registerUserEventListeners } from '@src/modules/Users/events/listeners/registerUserEventListeners';
import { UserIntegrationEventName } from '@src/modules/Users/events/contracts/UserIntegrationEventName';

describe('registerUserEventListeners', () => {
  it('registers all listeners and dispatches each event', async () => {
    expect.hasAssertions();
    const eventBus = InMemoryEventBus.compile();
    const onUserCreated = jest.fn(async () => undefined);
    const onUserUpdated = jest.fn(async () => undefined);
    const onUserDeleted = jest.fn(async () => undefined);
    const onUserPasswordUpdated = jest.fn(async () => undefined);

    registerUserEventListeners(eventBus, {
      onUserCreated,
      onUserUpdated,
      onUserDeleted,
      onUserPasswordUpdated
    });

    await eventBus.publish({
      name: UserIntegrationEventName.Created,
      payload: { id: 'u1' },
      occurredAt: new Date().toISOString()
    });
    await eventBus.publish({
      name: UserIntegrationEventName.Updated,
      payload: { id: 'u1' },
      occurredAt: new Date().toISOString()
    });
    await eventBus.publish({
      name: UserIntegrationEventName.Deleted,
      payload: { id: 'u1' },
      occurredAt: new Date().toISOString()
    });
    await eventBus.publish({
      name: UserIntegrationEventName.PasswordUpdated,
      payload: { id: 'u1' },
      occurredAt: new Date().toISOString()
    });

    expect(onUserCreated).toHaveBeenCalledTimes(1);
    expect(onUserUpdated).toHaveBeenCalledTimes(1);
    expect(onUserDeleted).toHaveBeenCalledTimes(1);
    expect(onUserPasswordUpdated).toHaveBeenCalledTimes(1);
  });
});
