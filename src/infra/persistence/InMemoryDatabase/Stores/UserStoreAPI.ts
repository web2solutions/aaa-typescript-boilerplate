import { IUser } from '@src/modules/Users/';
import { IPagingRequest } from '@src/modules/port/IPagingRequest';
import { IPagingResponse } from '@src/modules/port/IPagingResponse';
import { IStore } from '@src/infra/ports/persistence/IStore';

import { ConflictError, DataBaseNotFoundError, DatabasePagingError } from '@src/infra/exceptions';

export const matchAllFilters = (record: any, filters: any): boolean => {
  const filterProperties = Object.keys(filters);
  const mustMatch = filterProperties.length;
  let totalMatched = 0;
  for (const propertyName of filterProperties) {
    if (filters[propertyName] === record[propertyName]) totalMatched += 1;
  }
  return totalMatched === mustMatch;
};

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
      throw new DataBaseNotFoundError('Record not found - can not delete');
    }
  },
  getOneById: async (id: string) => {
    try {
      const result = userStore.get(id);
      return Promise.resolve(result);
    } catch (err) {
      throw new DataBaseNotFoundError('Record not found');
    }
  },
  // values: userStore.values.bind(userStore),
  create: async (key, value: IUser): Promise<IUser> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const object = value;
      if (userStore.has(key)) {
        throw new ConflictError('Duplicated id');
      }
      const username = object.username.toString().toLowerCase();
      if (userStoreUniqueIndexes.username.has(username)) {
        throw new ConflictError('username already in use');
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
        throw new DataBaseNotFoundError('Record not found');
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
        throw new DatabasePagingError('page must be greater than 0');
      }
      const result: IUser[] = [];
      let pages = 1;
      const total = userStore.size;
      pages = Math.ceil(total / limit);
      if (page > pages && total > 0) {
        throw new DatabasePagingError('page number must be smaller than the number of total pages');
      }
      const startAt = (page * limit) - limit;
      let iterated = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const value of userStore.values()) {
        // eslint-disable-next-line operator-assignment
        iterated = iterated + 1;
        if (iterated > startAt) {
          if (result.length < limit) {
            // console.log('XXXXXXXX', filters);
            if (matchAllFilters(value, filters)) result.push(value as IUser);
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
      throw error;
    }
  }
} as IStore<IUser>;
