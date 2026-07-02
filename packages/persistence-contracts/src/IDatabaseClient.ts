import { IStore } from './IStore';

export interface IDatabaseClient<
  TStores extends Record<string, IStore<unknown>> = Record<string, IStore<unknown>>
> {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  stores: TStores;
}
