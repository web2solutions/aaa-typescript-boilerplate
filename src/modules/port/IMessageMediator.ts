import { IEventBus } from '@src/modules/port/IEventBus';
import { IMessage, IMessageResponse } from '@src/modules/port/IMessage';

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
