import { IEventBus, IIntegrationEvent } from '@src/modules/port';

export class InMemoryEventBus implements IEventBus {
  private listeners: Record<string, Array<(event: IIntegrationEvent) => Promise<void> | void>> = {};

  public async publish(event: IIntegrationEvent): Promise<void> {
    const eventListeners = this.listeners[event.name] || [];
    await Promise.all(eventListeners.map(async (listener) => listener(event)));
  }

  public subscribe(
    eventName: string,
    listener: (event: IIntegrationEvent) => Promise<void> | void
  ): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  public static compile(): IEventBus {
    return new InMemoryEventBus();
  }
}
