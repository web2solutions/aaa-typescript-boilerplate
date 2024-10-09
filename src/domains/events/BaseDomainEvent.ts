import { IEventMessage } from './IEventMessage';

export abstract class BaseDomainEvent<TPayload = any> {
  public type: string = this.constructor.name;

  public authorization: string = '';

  public input: TPayload = {} as TPayload;

  public params: any = {};

  public queryString: any = {};

  public entity: string = '';

  public action: string = '';

  public message: any;

  public dateTime: Date = new Date();

  public schemaOAS: any = {};

  constructor(message: IEventMessage) {
    const {
      input,
      authorization,
      entity,
      action,
      params,
      queryString,
      schemaOAS
    } = message;
    this.input = input || {};
    if (typeof input === 'string') {
      this.input = JSON.parse(input);
    }
    if (authorization) {
      this.authorization = authorization;
    }
    this.entity = entity ?? '';
    this.action = action ?? '';
    if (params) {
      this.params = params;
    }
    if (queryString) {
      this.queryString = queryString;
    }
    if (schemaOAS) {
      this.schemaOAS = schemaOAS;
    }
  }
}
