import {
  IIntegrationEvent,
  IMessage,
  IMessageHandlerRegistrationOptions,
  IMessageMediator,
  IMessageRequestOptions,
  IMessageResponse,
  MessageHandler
} from '@src/modules/port';

interface IRegisteredHandler {
  handler: MessageHandler<any, any>;
  options?: IMessageHandlerRegistrationOptions;
}

export class InMemoryMessageMediatorAdapter implements IMessageMediator {
  private readonly eventListeners: Record<
    string,
    Array<(event: IIntegrationEvent) => Promise<void> | void>
  > = {};

  private readonly handlersByContract: Record<string, IRegisteredHandler> = {};

  private readonly handlersByRouteKey: Record<string, IRegisteredHandler> = {};

  private readonly handlersByQueueName: Record<string, IRegisteredHandler> = {};

  public async publish(event: IIntegrationEvent): Promise<void> {
    const listeners = this.eventListeners[event.name] || [];
    await Promise.all(listeners.map(async (listener) => listener(event)));
  }

  public subscribe(
    eventName: string,
    listener: (event: IIntegrationEvent) => Promise<void> | void
  ): void {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(listener);
  }

  public registerHandler<TPayload = any, TResult = any>(
    contract: string,
    handler: MessageHandler<TPayload, TResult>,
    options?: IMessageHandlerRegistrationOptions
  ): void {
    const registration: IRegisteredHandler = {
      handler: handler as MessageHandler<any, any>,
      options
    };

    this.handlersByContract[contract] = registration;

    if (options?.routeKey) {
      this.handlersByRouteKey[options.routeKey] = registration;
    }
    if (options?.queueName) {
      this.handlersByQueueName[options.queueName] = registration;
    }
  }

  public async request<TPayload = any, TResult = any>(
    message: IMessage<TPayload>,
    options?: IMessageRequestOptions
  ): Promise<IMessageResponse<TResult>> {
    const registration = this.resolveHandler(message.contract, options);

    if (!registration) {
      return {
        contract: message.contract,
        version: message.version,
        metadata: message.metadata,
        error: new Error(`No handler registered for contract ${message.contract}`)
      };
    }

    try {
      const response = await InMemoryMessageMediatorAdapter.executeRequestWithOptionalTimeout(
        registration.handler,
        message,
        options?.timeoutMs
      );

      return {
        ...response,
        contract: response.contract ?? message.contract,
        version: response.version ?? message.version,
        metadata: response.metadata ?? message.metadata
      } as IMessageResponse<TResult>;
    } catch (error) {
      return {
        contract: message.contract,
        version: message.version,
        metadata: message.metadata,
        error: error as Error
      };
    }
  }

  private resolveHandler(
    contract: string,
    options?: IMessageRequestOptions
  ): IRegisteredHandler | undefined {
    if (options?.routeKey && this.handlersByRouteKey[options.routeKey]) {
      return this.handlersByRouteKey[options.routeKey];
    }
    if (options?.queueName && this.handlersByQueueName[options.queueName]) {
      return this.handlersByQueueName[options.queueName];
    }
    return this.handlersByContract[contract];
  }

  private static async executeRequestWithOptionalTimeout(
    handler: MessageHandler<any, any>,
    message: IMessage<any>,
    timeoutMs?: number
  ): Promise<IMessageResponse<any>> {
    if (!timeoutMs || timeoutMs <= 0) {
      return handler(message);
    }

    return Promise.race([
      Promise.resolve(handler(message)),
      new Promise<IMessageResponse<any>>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Message request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  }

  public static compile(): IMessageMediator {
    return new InMemoryMessageMediatorAdapter();
  }
}
