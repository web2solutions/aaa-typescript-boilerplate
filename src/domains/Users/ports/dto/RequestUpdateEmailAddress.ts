import { EEmailAddressType } from '@src/domains/valueObjects';

export interface RequestUpdateEmailAddress {
  id: string;
  email?: string;
  type?: EEmailAddressType;
  isPrimary?: boolean;
}
