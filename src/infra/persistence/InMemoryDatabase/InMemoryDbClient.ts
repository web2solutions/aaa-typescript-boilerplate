// import { Account } from '@src/domains/Accounts';
import { IDbClient, IDbStores } from '../port/IDbClient';
import { AccountStoreAPI } from './Stores/AccountStoreAPI';
import { TransactionStoreAPI } from './Stores/TransactionStoreAPI';
import { UserStoreAPI } from './Stores/UserStoreAPI';

export const InMemoryDbClient: IDbClient = ((): IDbClient => {
  const stores: IDbStores = {
    Account: AccountStoreAPI,
    Transaction: TransactionStoreAPI,
    User: UserStoreAPI
  };
  const connect = () => Promise.resolve();
  const disconnect = () => Promise.resolve();
  return { stores, connect, disconnect };
})();

// mongoose and sequelize
