import { IUser } from '@src/domains/Users';
import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';

export const deleteUserById = async (
  id: string,
  repo: BaseRepo<IUser>
): Promise<boolean> => {
  try {
    await repo.delete(id);
    return Promise.resolve(true);
  } catch (err) {
    return Promise.reject(err);
  }
};
