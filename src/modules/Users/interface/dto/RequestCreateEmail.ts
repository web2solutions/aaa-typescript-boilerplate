import { EEmailType } from '@src/modules/ddd/valueObjects';

export interface RequestCreateEmail {
  email: string;
  type: EEmailType;
  isPrimary?: boolean;
}
