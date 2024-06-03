import { IUser } from '@src/domains/Users/Entity/IUser';
import { IStore } from '@src/domains/ports/persistence/IStore';

import {
  _DATABASE_NOT_FOUND_ERROR_NAME_,
  _DATABASE_DUPLICATED_RECORD_ERROR_NAME_
} from '@src/infra/config/constants';

const userStore = new Map<string, unknown>();
const userStoreUniqueIndexes = {
  username: new Map<string, unknown>()
};
export const UserStoreAPI = {
  delete: async (id: string) => {
    try {
      const result = userStore.delete(id);
      return Promise.resolve(!!result);
    } catch (err) {
      const error = new Error('Record not found - can not delete');
      error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
      return Promise.reject(error);
    }
  },
  getOneById: async (id: string) => {
    try {
      const result = userStore.get(id);
      return Promise.resolve(result);
    } catch (err) {
      const error = new Error('Record not found');
      error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
      return Promise.reject(error);
    }
  },
  // values: userStore.values.bind(userStore),
  create: async (key, value: IUser): Promise<IUser> => {
    try {
      const object = value;
      if (userStore.has(key)) {
        const error = new Error('Duplicated id');
        error.name = _DATABASE_DUPLICATED_RECORD_ERROR_NAME_;
        return Promise.reject(error);
      }
      const username = object.username.toString().toLowerCase();
      if (userStoreUniqueIndexes.username.has(username)) {
        const error = new Error('username already in use');
        error.name = _DATABASE_DUPLICATED_RECORD_ERROR_NAME_;
        return Promise.reject(error);
      }
      userStore.set(key, object);
      userStoreUniqueIndexes.username.set(username, object);
      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  update: async (key, value: IUser): Promise<IUser> => {
    try {
      const oldRecord = userStore.get(key);
      if (!oldRecord) {
        const error = new Error('Record not found');
        error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
        return Promise.reject(error);
      }
      const strOldName = (oldRecord as IUser).username.toString().toLowerCase();
      const object = value;
      const username = object.username.toString().toLowerCase();

      userStore.set(key, { ...object, _updatedAt: new Date() });
      userStoreUniqueIndexes.username.delete(strOldName);
      userStoreUniqueIndexes.username.set(username, object);
      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  getAll: async (page = 1, limit = 10) : Promise<IUser[]> => {
    try {
      if (page < 1) {
        return Promise.reject(new Error('page must be greater than 0'));
      }
      const records: IUser[] = [];
      let pages = 1;
      const count = userStore.size;
      pages = Math.ceil(count / limit);
      if (page > pages && count > 0) {
        return Promise.reject(new Error('page number must be less than the number of total pages'));
      }
      // const startAt = (page * limit) - limit;
      // let iterated = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const value of userStore.values()) {
        // eslint-disable-next-line operator-assignment
        // iterated = iterated + 1;
        // if (iterated > startAt) {
        // if (records.length < limit) {
        records.push(value as IUser);
        // }
        // }
      }

      return Promise.resolve(records);
    } catch (error) {
      return Promise.reject(error);
    }
  }
} as IStore<IUser>;
