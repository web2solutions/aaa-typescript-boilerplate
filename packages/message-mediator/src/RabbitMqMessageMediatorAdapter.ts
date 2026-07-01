/* istanbul ignore file */
import { randomUUID } from 'node:crypto';
import {
  IIntegrationEvent,
  IMessage,
  IMessageHandlerRegistrationOptions,
  IMessageMediator,
  IMessageRequestOptions,
  IMessageResponse,
  MessageHandler
} from './contracts';

interface IRabbitMqMediatorOptions {
  url: string;
  exchangeName?: string;
  defaultRequestQueue?: string;
  prefetch?: number;
}

interface IRegisteredHandler {
  handler: MessageHandler<any, any>;
  options?: IMessageHandlerRegistrationOptions;
}

export class RabbitMqMessageMediatorAdapter implements IMessageMediator {
  private readonly exchangeName: string;

  private readonly defaultRequestQueue: string;

  private readonly prefetch: number;

  private connection: any;

  private channel: any;

  private replyQueue = '';

  private initialized = false;

  private readonly eventListeners: Record<
    string,
    Array<(event: IIntegrationEvent) => Promise<void> | void>
  > = {};

  private readonly handlersByContract: Record<string, IRegisteredHandler> = {};

  private readonly handlersByRouteKey: Record<string, IRegisteredHandler> = {};

  private readonly handlersByQueueName: Record<string, IRegisteredHandler> = {};

  private readonly pendingRequests: Map<
    string,
    {
      resolve: (value: IMessageResponse<any>) => void;

      timeoutHandle: NodeJS.Timeout;
    }
  > = new Map();

  public constructor(private readonly options: IRabbitMqMediatorOptions) {
    this.exchangeName = options.exchangeName ?? 'app.events';
    this.defaultRequestQueue = options.defaultRequestQueue ?? 'app.requests';
    this.prefetch = options.prefetch ?? 10;
  }

  public async connect(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const amqpLib = await RabbitMqMessageMediatorAdapter.loadAmqpLib();
    this.connection = await amqpLib.connect(this.options.url);
    this.channel = await this.connection.createChannel();
    await this.channel.prefetch(this.prefetch);

    await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
    await this.channel.assertQueue(this.defaultRequestQueue, { durable: true });

    const replyQueueResult = await this.channel.assertQueue('', { exclusive: true, autoDelete: true });
    this.replyQueue = replyQueueResult.queue;

    await this.channel.consume(
      this.replyQueue,
      (msg: any) => {
        if (!msg) {
          return;
        }

        const correlationId = msg.properties?.correlationId;
        if (!correlationId) {
          this.channel.ack(msg);
          return;
        }

        const pending = this.pendingRequests.get(correlationId);
        if (!pending) {
          this.channel.ack(msg);
          return;
        }

        clearTimeout(pending.timeoutHandle);
        this.pendingRequests.delete(correlationId);
        pending.resolve(RabbitMqMessageMediatorAdapter.parseMessage(msg.content, {
          contract: 'unknown.contract'
        }));
        this.channel.ack(msg);
      },
      { noAck: false }
    );

    await this.channel.consume(
      this.defaultRequestQueue,
      async (msg: any) => {
        if (!msg) {
          return;
        }

        const payload = RabbitMqMessageMediatorAdapter.parseMessage(msg.content, {
          contract: msg.fields?.routingKey || 'unknown.contract',
          payload: {}
        });

        const response = await this.resolveRequest(payload, {
          queueName: msg.fields?.routingKey,
          routeKey: msg.fields?.routingKey
        });

        if (msg.properties?.replyTo) {
          this.channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId: msg.properties.correlationId }
          );
        }

        this.channel.ack(msg);
      },
      { noAck: false }
    );

    this.initialized = true;
  }

  public async disconnect(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    await this.channel.close();
    await this.connection.close();
    this.initialized = false;
  }

  public async publish(event: IIntegrationEvent): Promise<void> {
    await this.ensureConnected();
    const listeners = this.eventListeners[event.name] || [];
    await Promise.all(listeners.map(async (listener) => listener(event)));
    this.channel.publish(
      this.exchangeName,
      event.name,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );
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
    await this.ensureConnected();

    const correlationId = message.metadata?.correlationId ?? randomUUID();
    const timeoutMs = options?.timeoutMs ?? 15000;
    const queueName = options?.queueName ?? this.defaultRequestQueue;
    const routeKey = options?.routeKey ?? message.contract;

    const brokerResponse = await new Promise<IMessageResponse<TResult>>((resolve) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        resolve({
          contract: message.contract,
          version: message.version,
          metadata: message.metadata,
          error: new Error(`Message request timed out after ${timeoutMs}ms`)
        });
      }, timeoutMs);

      this.pendingRequests.set(correlationId, {
        resolve: resolve as (value: IMessageResponse<any>) => void,
        timeoutHandle
      });

      this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)),
        {
          correlationId,
          replyTo: this.replyQueue,
          contentType: 'application/json',
          persistent: true,
          headers: {
            ...message.metadata?.headers,
            routeKey
          }
        }
      );
    });

    if (!brokerResponse.error) {
      return brokerResponse;
    }

    return this.resolveRequest(message, options) as Promise<IMessageResponse<TResult>>;
  }

  private async resolveRequest<TPayload = any, TResult = any>(
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
      const response = await registration.handler(message);
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

  private async ensureConnected(): Promise<void> {
    if (!this.initialized) {
      await this.connect();
    }
  }

  private static async loadAmqpLib(): Promise<any> {
    try {
      return await import('amqplib');
    } catch (error) {
      const err = new Error(
        'RabbitMQ adapter requires package "amqplib". Install with: npm install amqplib'
      );
      (err as any).cause = error as Error;
      throw err;
    }
  }

  private static parseMessage(content: Buffer, fallback: any): any {
    try {
      return JSON.parse(content.toString());
    } catch {
      return fallback;
    }
  }
}
