import { operators } from './operators';

export interface IFilter {
  atrributeName: string;
  operator: operators;
  value: unknown,
}
