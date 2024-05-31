import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { RequestUpdateEmail } from '../ports/dto/RequestUpdateEmail';

export class EmailUpdateRequestEvent extends BaseDomainEvent {
  public payload: RequestUpdateEmail;

  constructor(config: RequestUpdateEmail) {
    super();
    const {
      id,
      email,
      type,
      isPrimary
    } = config;
    this.payload = {
      id
    };
    if (email) this.payload.email = email;
    if (type) this.payload.type = type;
    if (typeof isPrimary !== 'undefined') this.payload.isPrimary = isPrimary ?? false;
  }
}
