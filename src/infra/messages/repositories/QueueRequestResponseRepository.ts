import {
  IMessage,
  IMessageMediator,
  IMessageRequestOptions,
  IMessageResponse
} from '@src/modules/port';

export interface IQueueRequestResponseRepository {
  sendRequest<TPayload = any, TResult = any>(
    contract: string,
    payload: TPayload,
    options?: IMessageRequestOptions
  ): Promise<IMessageResponse<TResult>>;
}

export class QueueRequestResponseRepository implements IQueueRequestResponseRepository {
  private readonly mediator: IMessageMediator;

  constructor(mediator: IMessageMediator) {
    this.mediator = mediator;
  }

  public async sendRequest<TPayload = any, TResult = any>(
    contract: string,
    payload: TPayload,
    options?: IMessageRequestOptions
  ): Promise<IMessageResponse<TResult>> {
    const message: IMessage<TPayload> = {
      contract,
      version: '1.0.0',
      payload,
      metadata: {
        traceId: `queue-rr-${Date.now()}`
      }
    };

    return this.mediator.request<TPayload, TResult>(message, options);
  }
}
