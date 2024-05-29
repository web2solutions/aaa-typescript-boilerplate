import { IAccount } from '@src/domains/Accounts/Entity/IAccount';
import { IStore } from '@src/domains/ports/persistence/IStore';
import {
  _DATABASE_NOT_FOUND_ERROR_NAME_,
  _DATABASE_DUPLICATED_RECORD_ERROR_NAME_
} from '@src/infra/config/constants';

const accountStore = new Map<string, unknown>();
const accountStoreUniqueIndexes = {
  userEmail: new Map<string, unknown>()
};
export const AccountStoreAPI = {
  delete: async (id: string) => {
    try {
      const result = accountStore.delete(id);
      return Promise.resolve(!!result);
    } catch (err) {
      const error = new Error('Record not found - can not delete');
      error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
      return Promise.reject(error);
    }
  },
  getOneById: async (id: string) => {
    try {
      const result = accountStore.get(id);
      return Promise.resolve(result);
    } catch (err) {
      const error = new Error('Record not found');
      error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
      return Promise.reject(error);
    }
  },
  // values: accountStore.values.bind(accountStore),
  create: async (key, value: IAccount): Promise<IAccount> => {
    try {
      const object = value;
      if (accountStore.has(key)) {
        const error = new Error('Duplicated id');
        error.name = _DATABASE_DUPLICATED_RECORD_ERROR_NAME_;
        return Promise.reject(error);
      }
      const strName = object.userEmail.toString().toLowerCase();
      if (accountStoreUniqueIndexes.userEmail.has(strName)) {
        const error = new Error('userEmail already in use');
        error.name = _DATABASE_DUPLICATED_RECORD_ERROR_NAME_;
        return Promise.reject(error);
      }
      accountStore.set(key, object);
      accountStoreUniqueIndexes.userEmail.set(strName, object);
      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  update: async (key, value: IAccount): Promise<IAccount> => {
    try {
      const oldRecord = accountStore.get(key);
      if (!oldRecord) {
        const error = new Error('Record not found');
        error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
        return Promise.reject(error);
      }
      const strOldName = (oldRecord as IAccount).userEmail.toString().toLowerCase();
      const object = value;
      const strName = object.userEmail.toString().toLowerCase();

      accountStore.set(key, { ...object, _updatedAt: new Date() });
      accountStoreUniqueIndexes.userEmail.delete(strOldName);
      accountStoreUniqueIndexes.userEmail.set(strName, object);
      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getByUserEmail: async (userEmail: string): Promise<IAccount> => {
    try {
      const strName = userEmail.toString().toLowerCase();
      const data = accountStoreUniqueIndexes.userEmail.get(strName) as IAccount;
      if (!data) {
        const error = new Error('Not Found - Record not found');
        error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
        return Promise.reject(error);
      }
      return Promise.resolve({
        ...data,
        id: data.id
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getAll: async (page = 1, limit = 10) : Promise<IAccount[]> => {
    try {
      if (page < 1) {
        return Promise.reject(new Error('page must be greater than 0'));
      }
      const records: IAccount[] = [];
      let pages = 1;
      const count = accountStore.size;
      pages = Math.ceil(count / limit);
      if (page > pages && count > 0) {
        return Promise.reject(new Error('page number must be less than the number of total pages'));
      }
      // const startAt = (page * limit) - limit;
      // let iterated = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const value of accountStore.values()) {
        // eslint-disable-next-line operator-assignment
        // iterated = iterated + 1;
        // if (iterated > startAt) {
        // if (records.length < limit) {
        records.push(value as IAccount);
        // }
        // }
      }

      return Promise.resolve(records);
    } catch (error) {
      return Promise.reject(error);
    }
  }
} as IStore<IAccount>;
