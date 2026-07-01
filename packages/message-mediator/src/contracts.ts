export interface IIntegrationEvent {
  name: string;
  payload: Record<string, any>;
  occurredAt: string;
  metadata?: Record<string, any>;
}

export interface IMessageMetadata {
  requestId?: string;
  correlationId?: string;
  causationId?: string;
  replyTo?: string;
  timestamp?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

export interface IMessage<TPayload = any> {
  contract: string;
  version?: string;
  payload: TPayload;
  metadata?: IMessageMetadata;
}

export interface IMessageResponse<TResult = any> {
  contract: string;
  version?: string;
  metadata?: IMessageMetadata;
  result?: TResult;
  error?: Error | Record<string, any>;
}

export interface IEventBus {
  publish(event: IIntegrationEvent): Promise<void>;
  subscribe(eventName: string, listener: (event: IIntegrationEvent) => Promise<void> | void): void;
}

export type MessageHandler<TPayload = any, TResult = any> =
  (message: IMessage<TPayload>) => Promise<IMessageResponse<TResult>> | IMessageResponse<TResult>;

export interface IMessageRequestOptions {
  timeoutMs?: number;
  routeKey?: string;
  queueName?: string;
}

export interface IMessageHandlerRegistrationOptions {
  queueName?: string;
  routeKey?: string;
  durable?: boolean;
  concurrency?: number;
}

export interface IMessageMediator extends IEventBus {
  registerHandler<TPayload = any, TResult = any>(
    contract: string,
    handler: MessageHandler<TPayload, TResult>,
    options?: IMessageHandlerRegistrationOptions
  ): void;

  request<TPayload = any, TResult = any>(
    message: IMessage<TPayload>,
    options?: IMessageRequestOptions
  ): Promise<IMessageResponse<TResult>>;
}
