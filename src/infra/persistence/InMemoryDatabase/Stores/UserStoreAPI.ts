import { IUser } from '@src/domains/Users/Entity/IUser';
import { IPagingRequest } from '@src/domains/ports/persistence/IPagingRequest';
import { IPagingResponse } from '@src/domains/ports/persistence/IPagingResponse';
import { IStore } from '@src/domains/ports/persistence/IStore';

import {
  _DATABASE_NOT_FOUND_ERROR_NAME_,
  _DATABASE_DUPLICATED_RECORD_ERROR_NAME_,
  _DATABASE_PAGING_ERROR_
} from '@src/infra/config/constants';

const userStore = new Map<string, unknown>();
const userStoreUniqueIndexes = {
  username: new Map<string, unknown>()
};
export const UserStoreAPI = {
  delete: async (id: string) => {
    try {
      const result = userStore.delete(id);
      return !!result;
    } catch (err) {
      const error = new Error('Record not found - can not delete');
      error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
      throw error;
    }
  },
  getOneById: async (id: string) => {
    try {
      const result = userStore.get(id);
      return Promise.resolve(result);
    } catch (err) {
      const error = new Error('Record not found');
      error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
      throw error;
    }
  },
  // values: userStore.values.bind(userStore),
  create: async (key, value: IUser): Promise<IUser> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const object = value;
      if (userStore.has(key)) {
        const error = new Error('Duplicated id');
        error.name = _DATABASE_DUPLICATED_RECORD_ERROR_NAME_;
        throw error;
      }
      const username = object.username.toString().toLowerCase();
      if (userStoreUniqueIndexes.username.has(username)) {
        const error = new Error('username already in use');
        error.name = _DATABASE_DUPLICATED_RECORD_ERROR_NAME_;
        throw error;
      }
      userStore.set(key, object);
      userStoreUniqueIndexes.username.set(username, object);
      return value;
    } catch (error) {
      // console.log(error);
      throw error;
    }
  },
  update: async (key, value: IUser): Promise<IUser> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const oldRecord = userStore.get(key);
      if (!oldRecord) {
        const error = new Error('Record not found');
        error.name = _DATABASE_NOT_FOUND_ERROR_NAME_;
        throw error;
      }
      const strOldName = (oldRecord as IUser).username.toString().toLowerCase();
      const object = { ...oldRecord, ...value };
      const username = object.username.toString().toLowerCase();

      userStore.set(key, { ...object, _updatedAt: new Date() });
      userStoreUniqueIndexes.username.delete(strOldName);
      userStoreUniqueIndexes.username.set(username, object);
      return value;
    } catch (error) {
      // console.log(error)
      throw error;
    }
  },

  getAll: async (
    filters: Record<string, string|number>,
    paging: IPagingRequest
  ) : Promise<IPagingResponse<IUser[]>> => {
    const { page, size } = paging;
    const limit = size;
    // eslint-disable-next-line no-useless-catch
    try {
      if (page < 1) {
        throw new Error('page must be greater than 0');
      }
      const result: IUser[] = [];
      let pages = 1;
      const total = userStore.size;
      pages = Math.ceil(total / limit);
      if (page > pages && total > 0) {
        throw new Error('page number must be smaller than the number of total pages');
      }
      const startAt = (page * limit) - limit;
      let iterated = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const value of userStore.values()) {
        // eslint-disable-next-line operator-assignment
        iterated = iterated + 1;
        if (iterated > startAt) {
          if (result.length < limit) {
            result.push(value as IUser);
          }
        }
      }

      return {
        result,
        total,
        page,
        size
      };
    } catch (error) {
      (error as Error).name = _DATABASE_PAGING_ERROR_;
      throw error;
    }
  }
} as IStore<IUser>;
