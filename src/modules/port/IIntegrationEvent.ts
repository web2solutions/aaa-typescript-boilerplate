export interface IIntegrationEvent {
  name: string;
  payload: Record<string, any>;
  occurredAt: string;
  metadata?: Record<string, any>;
}
