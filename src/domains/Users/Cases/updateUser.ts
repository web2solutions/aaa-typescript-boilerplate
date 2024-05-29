import { RequestUpdateUser } from '@src/domains/Users';
import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';
import { IUser, User } from '..';

export const updateUser = async (
  id: string,
  payload: RequestUpdateUser,
  repo: BaseRepo<User>
): Promise<IUser> => {
  const model: User = new User({ ...payload, id });
  const document = await repo.update(id, model);
  return document.serialize();
};
