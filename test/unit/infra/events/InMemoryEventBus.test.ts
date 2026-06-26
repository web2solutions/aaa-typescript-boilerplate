import { InMemoryEventBus } from '@src/infra/events/InMemoryEventBus';

describe('in-memory event bus', () => {
  it('publishes events to subscribed listeners', async () => {
    expect.hasAssertions();
    const eventBus = InMemoryEventBus.compile();
    const listener = jest.fn(async () => undefined);

    eventBus.subscribe('users.user.created', listener);
    await eventBus.publish({
      name: 'users.user.created',
      payload: { id: 'u1' },
      occurredAt: new Date().toISOString()
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      name: 'users.user.created',
      payload: { id: 'u1' }
    }));
  });
});
