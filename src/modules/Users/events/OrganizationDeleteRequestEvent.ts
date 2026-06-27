import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { IEventMessage } from '@src/modules/port/IEventMessage';
import { canNotBeEmpty } from '@src/shared/validators';
import { ComposeEventError } from '@src/infra/exceptions';

export class OrganizationDeleteRequestEvent extends BaseDomainEvent {
  constructor(message: IEventMessage) {
    super(message);
    try {
      this.entity = 'Organization';
      this.action = 'delete';
      canNotBeEmpty('message.authorization', message.authorization);
      canNotBeEmpty('message.params', message.params);
    } catch (err) {
      throw new ComposeEventError((err as any).message);
    }
  }
}
