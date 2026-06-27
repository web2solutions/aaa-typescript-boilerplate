import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { IEventMessage } from '@src/modules/port/IEventMessage';
import { canNotBeEmpty } from '@src/shared/validators';
import { ComposeEventError } from '@src/infra/exceptions';

export class OrganizationGetAllRequestEvent extends BaseDomainEvent {
  constructor(message: IEventMessage) {
    super(message);
    this.entity = 'Organization';
    this.action = 'getAll';
    try {
      canNotBeEmpty('message.authorization', message.authorization);
      canNotBeEmpty('message.queryString', message.queryString);
    } catch (err) {
      throw new ComposeEventError((err as any).message);
    }
  }
}
