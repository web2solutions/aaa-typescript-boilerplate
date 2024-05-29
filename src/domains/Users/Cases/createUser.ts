import { RequestCreateUser } from '@src/domains/Users';
import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';
import { IUser, User } from '..';

export const createUser = async (
  payload: RequestCreateUser,
  repo: BaseRepo<User>
): Promise<IUser> => {
  const model: User = new User(payload);
  const document = await repo.create(model);
  return document.serialize();
};
