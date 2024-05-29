import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { RequestUpdatePhone } from '../ports/dto/RequestUpdatePhone';

export class PhoneUpdateRequestEvent extends BaseDomainEvent {
  public payload: RequestUpdatePhone;

  constructor(config: RequestUpdatePhone) {
    super();
    const {
      id,
      countryCode,
      localCode,
      number, isPrimary
    } = config;
    this.payload = {
      id
    };
    if (countryCode) this.payload.countryCode = countryCode;
    if (localCode) this.payload.localCode = localCode;
    if (number) this.payload.number = number;
    if (typeof isPrimary !== 'undefined') this.payload.isPrimary = isPrimary ?? false;
  }
}
