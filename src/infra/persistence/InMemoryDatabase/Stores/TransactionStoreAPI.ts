import { ITransaction } from '@src/domains/Transactions/Entity/ITransaction';
import { IStore } from '@src/domains/ports/persistence/IStore';
import {
  _DATABASE_NOT_FOUND_ERROR_NAME_,
  _DATABASE_DUPLICATED_RECORD_ERROR_NAME_
} from '@src/infra/config/constants';

const transactionStore = new Map<string, unknown>();

export const TransactionStoreAPI = {
  delete: async (id: string) => {
    try {
      const result = transactionStore.delete(id);
      return Promise.resolve(!!result);
    } catch (err) {
      const error = new Error('Record not found - can not delete');
      error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
      return Promise.reject(error);
    }
  },
  getOneById: async (id: string) => {
    try {
      const result = transactionStore.get(id);
      return Promise.resolve(result);
    } catch (err) {
      const error = new Error('Record not found');
      error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
      return Promise.reject(error);
    }
  },
  // values: transactionStore.values.bind(transactionStore),
  create: async (key, value: ITransaction): Promise<ITransaction> => {
    try {
      const object = value;
      if (transactionStore.has(key)) {
        const error = new Error('Duplicated id');
        error.name = _DATABASE_DUPLICATED_RECORD_ERROR_NAME_;
        return Promise.reject(error);
      }

      transactionStore.set(key, object);

      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  update: async (key, value: ITransaction): Promise<ITransaction> => {
    try {
      const oldRecord = transactionStore.get(key);
      if (!oldRecord) {
        const error = new Error('Record not found');
        error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
        return Promise.reject(error);
      }

      transactionStore.set(key, { ...value, _updatedAt: new Date() });

      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getAll: async (page = 1, limit = 10) : Promise<ITransaction[]> => {
    try {
      if (page < 1) {
        return Promise.reject(new Error('page must be greater than 0'));
      }
      const records: ITransaction[] = [];
      let pages = 1;
      const count = transactionStore.size;
      pages = Math.ceil(count / limit);
      if (page > pages && count > 0) {
        return Promise.reject(new Error('page number must be less than the number of total pages'));
      }
      // const startAt = (page * limit) - limit;
      // let iterated = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const value of transactionStore.values()) {
        // eslint-disable-next-line operator-assignment
        // iterated = iterated + 1;
        // if (iterated > startAt) {
        // if (records.length < limit) {
        records.push(value as ITransaction);
        // }
        // }
      }

      return Promise.resolve(records);
    } catch (error) {
      return Promise.reject(error);
    }
  }
} as IStore<ITransaction>;
