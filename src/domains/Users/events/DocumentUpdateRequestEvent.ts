import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { RequestUpdateDocument } from '../ports/dto/RequestUpdateDocument';

export class DocumentUpdateRequestEvent extends BaseDomainEvent {
  public payload: RequestUpdateDocument;

  constructor(config: RequestUpdateDocument) {
    super();
    const {
      id,
      data,
      type,
      countryIssue
    } = config;
    this.payload = {
      id
    };
    if (data) this.payload.data = data;
    if (type) this.payload.type = type;
    if (countryIssue) this.payload.countryIssue = countryIssue;
  }
}
