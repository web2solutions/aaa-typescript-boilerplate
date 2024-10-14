import { IFilter } from '@src/modules/port';

export interface ISearch {
  operator?: string;
  filters?: IFilter[];
}
