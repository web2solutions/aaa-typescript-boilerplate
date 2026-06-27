// import { Account } from '@src/domains/Accounts';
import { IDatabaseClient, IDbStores } from '../port/IDatabaseClient';
import { UserStoreAPI } from './Stores/UserStoreAPI';
import { OrganizationStoreAPI } from './Stores/OrganizationStoreAPI';

export const InMemoryDbClient: IDatabaseClient = ((): IDatabaseClient => {
  const stores: IDbStores = {
    User: UserStoreAPI,
    Organization: OrganizationStoreAPI
  };
  const connect = () => Promise.resolve();
  const disconnect = () => Promise.resolve();
  return { stores, connect, disconnect };
})();

// mongoose and sequelize
