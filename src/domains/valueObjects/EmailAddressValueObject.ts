/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { UUID } from '../utils';
import { canNotBeEmpty } from '../validators';
import { EEmailAddressType } from './EEmailAddressType';

export interface EmailAddressValueObject {
  id: string;
  email: string;
  type: EEmailAddressType;
  isPrimary: boolean;
}

export class EmailAddressValueObject {
  public id: string;

  public type: EEmailAddressType;

  public email: string;

  public isPrimary: boolean;

  constructor(payload: any) {
    const {
      id,
      type,
      email,
      isPrimary
    } = payload;
    canNotBeEmpty('email', email);
    canNotBeEmpty('type', type);
    this.id = id ? UUID.parse(id).toString() : UUID.create().toString();
    this.email = email;
    this.type = type;
    this.isPrimary = !!isPrimary ?? false;
  }
}
