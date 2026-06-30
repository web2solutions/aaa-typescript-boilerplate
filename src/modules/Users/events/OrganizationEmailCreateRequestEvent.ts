import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { IEventMessage } from '@src/modules/port/IEventMessage';
import { canNotBeEmpty } from '@src/shared/validators';
import { ComposeEventError } from '@src/infra/exceptions';

export class OrganizationEmailCreateRequestEvent extends BaseDomainEvent {
  constructor(message: IEventMessage) {
    super(message);
    try {
      this.entity = 'Organization';
      this.action = 'createEmail';
      canNotBeEmpty('message.authorization', message.authorization);
      canNotBeEmpty('message.params.id', message.params?.id);
      canNotBeEmpty('message.input', message.input);
    } catch (err) {
      throw new ComposeEventError((err as any).message);
    }
  }
}
