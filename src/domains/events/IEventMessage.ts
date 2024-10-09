export interface IEventMessage<TPayload = any> {
  input?: TPayload;
  params?: any;
  queryString?: any;
  authorization?: string;
  entity?: string;
  action?: string;
  schemaOAS?: any;
}
