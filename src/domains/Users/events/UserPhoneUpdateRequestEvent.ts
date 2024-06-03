import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { IEventMessage } from '@src/domains/events/IEventMessage';
import { canNotBeEmpty } from '@src/domains/validators';
import { _EVENT_INVALID_MESSAGE_ } from '@src/infra/config/constants';

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
      const error = new Error((err as any).message);
      error.name = _EVENT_INVALID_MESSAGE_;
      throw error;
    }
  }
}
