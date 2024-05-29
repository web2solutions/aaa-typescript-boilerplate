import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { RequestUpdateEmailAddress } from '../ports/dto/RequestUpdateEmailAddress';

export class EmailAddressUpdateRequestEvent extends BaseDomainEvent {
  public payload: RequestUpdateEmailAddress;

  constructor(config: RequestUpdateEmailAddress) {
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
