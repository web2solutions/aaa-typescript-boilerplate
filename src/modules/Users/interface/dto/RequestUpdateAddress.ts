import { RequestCreateAddress } from '@src/modules/Users/interface/dto/RequestCreateAddress';

export interface RequestUpdateAddress extends Partial<RequestCreateAddress> {
  id: string;
}
