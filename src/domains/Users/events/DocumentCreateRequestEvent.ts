/* eslint-disable jest/require-hook */
import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { RequestCreateDocument } from '../ports/dto/RequestCreateDocument';

export class DocumentCreateRequestEvent extends BaseDomainEvent {
  public payload: RequestCreateDocument;

  constructor(config: RequestCreateDocument) {
    super();
    const {
      data,
      type,
      countryIssue
    } = config;
    this.payload = {
      data,
      type,
      countryIssue
    };
  }
}
