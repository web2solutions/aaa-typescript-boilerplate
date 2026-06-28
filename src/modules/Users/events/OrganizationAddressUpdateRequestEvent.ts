import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { IEventMessage } from '@src/modules/port/IEventMessage';
import { canNotBeEmpty } from '@src/shared/validators';
import { ComposeEventError } from '@src/infra/exceptions';

export class OrganizationAddressUpdateRequestEvent extends BaseDomainEvent {
  constructor(message: IEventMessage) {
    super(message);
    try {
      this.entity = 'Organization';
      this.action = 'updateAddress';
      canNotBeEmpty('message.authorization', message.authorization);
      canNotBeEmpty('message.params.id', message.params?.id);
      canNotBeEmpty('message.params.addressId', message.params?.addressId);
      canNotBeEmpty('message.input', message.input);
    } catch (err) {
      throw new ComposeEventError((err as any).message);
    }
  }
}
