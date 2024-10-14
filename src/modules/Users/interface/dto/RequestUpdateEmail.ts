import { EEmailType } from '@src/modules/ddd/valueObjects';

export interface RequestUpdateEmail {
  id: string;
  email?: string;
  type?: EEmailType;
  isPrimary?: boolean;
}
