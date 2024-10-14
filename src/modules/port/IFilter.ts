import { operators } from '@src/modules/port';

export interface IFilter {
  atrributeName: string;
  operator: operators;
  value: unknown,
}
