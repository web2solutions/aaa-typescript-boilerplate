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
