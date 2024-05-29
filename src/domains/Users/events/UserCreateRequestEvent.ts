import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { RequestCreateUser } from '../ports/dto/RequestCreateUser';

export class UserCreateRequestEvent extends BaseDomainEvent {
  public payload: RequestCreateUser;

  constructor(config: RequestCreateUser) {
    super();
    const {
      firstName,
      lastName,
      avatar,
      login,
      emails,
      documents,
      phones,
      roles
    } = config;
    this.payload = {
      firstName,
      lastName: lastName ?? '',
      avatar: avatar ?? '',
      login,
      emails,
      documents: documents ?? [],
      phones: phones ?? [],
      roles: roles ?? []
    };
  }
}
