import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { IEventMessage } from '@src/modules/port/IEventMessage';
import { canNotBeEmpty } from '@src/shared/validators';
import { ComposeEventError } from '@src/infra/exceptions';

export class UserPhoneUpdateRequestEvent extends BaseDomainEvent {
  constructor(message: IEventMessage) {
    super(message);
    try {
      this.entity = 'User';
      this.action = 'updatePhone';
      canNotBeEmpty('message.authorization', message.authorization);
      canNotBeEmpty('message.input', message.input);
      canNotBeEmpty('message.params', message.params);
    } catch (err) {
      throw new ComposeEventError((err as any).message);
    }
  }
}
