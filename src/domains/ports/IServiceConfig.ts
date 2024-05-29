import { IAccount, Account } from '@src/domains/Accounts';
import { ITransaction, Transaction } from '@src/domains/Transactions';
import { IUser, User } from '@src/domains/Users';
import { BaseRepo } from './BaseRepo';
import { BaseService } from './BaseService';
// import { IStore } from './IStore';
export type TRepos = Record<string, BaseRepo<IAccount | ITransaction | IUser>>
export type TServices =
  Record<string, BaseService<IAccount | ITransaction | IUser, Account | Transaction | User>>

export interface IServiceConfig {
  repos?: TRepos;
  services?: TServices;
}
