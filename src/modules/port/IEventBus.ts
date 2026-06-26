import { IIntegrationEvent } from '@src/modules/port/IIntegrationEvent';

export interface IEventBus {
  publish(event: IIntegrationEvent): Promise<void>;
  subscribe(eventName: string, listener: (event: IIntegrationEvent) => Promise<void> | void): void;
}
