// import { Account } from '@src/domains/Accounts';
import { IDatabaseClient, IDbStores } from '../port/IDatabaseClient';
import { UserStoreAPI } from './Stores/UserStoreAPI';

export const InMemoryDbClient: IDatabaseClient = ((): IDatabaseClient => {
  const stores: IDbStores = {
    User: UserStoreAPI
  };
  const connect = () => Promise.resolve();
  const disconnect = () => Promise.resolve();
  return { stores, connect, disconnect };
})();

// mongoose and sequelize
