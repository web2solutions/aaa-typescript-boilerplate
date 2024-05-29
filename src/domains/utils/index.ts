// eslint-disable-next-line no-shadow
export enum operators {
  equal = 'equal',
}

export interface IFilter {
  atrributeName: string;
  operator: operators;
  value: unknown,
}

export interface ISearch {
  operator?: string;
  filters?: IFilter[];
}

export { UUID } from './UUID';
