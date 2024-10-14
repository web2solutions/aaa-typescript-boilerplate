import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { IEventMessage } from '@src/modules/port/IEventMessage';
import { canNotBeEmpty } from '@src/shared/validators';
import { ComposeEventError } from '@src/infra/exceptions';

export class RegisterRequestEvent<TPayload = any> extends BaseDomainEvent<TPayload> {
  constructor(message: IEventMessage<TPayload>) {
    super(message);
    try {
      this.entity = 'Auth';
      this.action = 'logout';
      // canNotBeEmpty('message.authorization', message.authorization);
      canNotBeEmpty('message.input', message.input);
    } catch (err) {
      throw new ComposeEventError((err as any).message);
    }
  }
}
