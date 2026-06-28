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

  it('publishes without listeners and supports multiple subscribers on same event', async () => {
    expect.hasAssertions();
    const eventBus = InMemoryEventBus.compile();
    const first = jest.fn(async () => undefined);
    const second = jest.fn(async () => undefined);

    await eventBus.publish({
      name: 'users.user.bootstrap',
      payload: { id: 'noop-before-subscribe' },
      occurredAt: new Date().toISOString()
    });

    eventBus.subscribe('users.user.updated', first);
    eventBus.subscribe('users.user.updated', second);

    await eventBus.publish({
      name: 'users.user.updated',
      payload: { id: 'u2' },
      occurredAt: new Date().toISOString()
    });
    await eventBus.publish({
      name: 'users.user.unknown',
      payload: { id: 'noop' },
      occurredAt: new Date().toISOString()
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
