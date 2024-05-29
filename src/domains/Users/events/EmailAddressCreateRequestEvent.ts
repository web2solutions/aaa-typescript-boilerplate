import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { RequestCreateEmailAddress } from '../ports/dto/RequestCreateEmailAddress';

export class EmailAddressCreateRequestEvent extends BaseDomainEvent {
  public payload: RequestCreateEmailAddress;

  constructor(config: RequestCreateEmailAddress) {
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
