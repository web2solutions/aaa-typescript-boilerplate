export interface IEventMessage {
  input?: any;
  params?: any;
  queryString?: any;
  authorization: string;
  entity?: string;
  action?: string;
  schemaOAS?: any;
}
