import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { RequestCreateEmail } from '../ports/dto/RequestCreateEmail';

export class EmailCreateRequestEvent extends BaseDomainEvent {
  public payload: RequestCreateEmail;

  constructor(config: RequestCreateEmail) {
    super();
    const {
      email,
      type,
      isPrimary
    } = config;
    this.payload = {
      email,
      type,
      isPrimary: typeof isPrimary === 'boolean' ? isPrimary : false
    };
  }
}
