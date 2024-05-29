import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { RequestCreatePhone } from '../ports/dto/RequestCreatePhone';

export class PhoneCreateRequestEvent extends BaseDomainEvent {
  public payload: RequestCreatePhone;

  constructor(config: RequestCreatePhone) {
    super();
    const {
      countryCode,
      localCode,
      number, isPrimary
    } = config;
    this.payload = {
      countryCode,
      localCode,
      number,
      isPrimary: typeof isPrimary === 'boolean' ? isPrimary : false
    };
  }
}
