import { EEmailAddressType } from '@src/domains/valueObjects';

export interface RequestCreateEmailAddress {
  email: string;
  type: EEmailAddressType;
  isPrimary?: boolean;
}
