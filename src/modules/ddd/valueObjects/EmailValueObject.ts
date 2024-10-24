/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { UUID } from '@src/modules/port';
import { canNotBeEmpty } from '@src/shared/validators';
import { EEmailType } from '@src/modules/ddd/valueObjects/EEmailType';

export interface EmailValueObject {
  id: string;
  email: string;
  type: EEmailType;
  isPrimary: boolean;
}

export class EmailValueObject {
  public id: string;

  public type: EEmailType;

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
    this.isPrimary = !!isPrimary || false;
  }
}
