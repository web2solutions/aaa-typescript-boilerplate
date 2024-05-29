import { IUser, User } from '@src/domains/Users';
import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';

export const getUserById = async (
  id: string,
  repo: BaseRepo<User>
): Promise<IUser> => {
  try {
    const model = await repo.getOneById(id);
    return Promise.resolve(model.serialize());
  } catch (err) {
    return Promise.reject(err);
  }
};
