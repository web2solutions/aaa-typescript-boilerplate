import { EEmailType } from '@src/domains/valueObjects';

export interface RequestCreateEmail {
  email: string;
  type: EEmailType;
  isPrimary?: boolean;
}
