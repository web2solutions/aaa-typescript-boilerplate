import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { IEventMessage } from '@src/domains/events/IEventMessage';
import { canNotBeEmpty } from '@src/domains/validators';
import { _EVENT_INVALID_MESSAGE_ } from '@src/infra/config/constants';

export class UserPasswordUpdateRequestEvent extends BaseDomainEvent {
  constructor(message: IEventMessage) {
    super(message);
    try {
      this.entity = 'User';
      this.action = 'update';
      canNotBeEmpty('message.authorization', message.authorization);
      canNotBeEmpty('message.params', message.params);
      canNotBeEmpty('message.input', message.input);
    } catch (err) {
      const error = new Error((err as any).message);
      error.name = _EVENT_INVALID_MESSAGE_;
      throw error;
    }
  }
}
