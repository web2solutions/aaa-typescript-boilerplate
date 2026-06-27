/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { UUID } from '@src/modules/port';
import { canNotBeEmpty } from '@src/shared/validators';
import { EAddressType } from '@src/modules/ddd/valueObjects/EAddressType';

export interface AddressValueObject {
  id: string;
  email: string;
  type: EAddressType;
  isPrimary: boolean;
}

export class AddressValueObject {
  public id: string;

  public email: string;

  public type: EAddressType;

  public isPrimary: boolean;

  constructor(payload: any) {
    const {
      id,
      email,
      type,
      isPrimary
    } = payload;
    canNotBeEmpty('email', email);
    canNotBeEmpty('type', type);
    if (!Object.values(EAddressType).includes(type)) {
      throw new Error(`Address type must be one of: ${Object.values(EAddressType).join(', ')}`);
    }
    this.id = id ? UUID.parse(id).toString() : UUID.create().toString();
    this.email = email;
    this.type = type;
    this.isPrimary = !!isPrimary || false;
  }
}
