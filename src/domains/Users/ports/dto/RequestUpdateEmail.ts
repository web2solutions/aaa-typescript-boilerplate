import { EEmailType } from '@src/domains/valueObjects';

export interface RequestUpdateEmail {
  id: string;
  email?: string;
  type?: EEmailType;
  isPrimary?: boolean;
}
