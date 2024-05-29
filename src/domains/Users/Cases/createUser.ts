import { RequestCreateUser, RequestUpdateUser } from '@src/domains/Users';
import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';
import { IUser, User } from '..';

export const createUser = async (
  payload: RequestCreateUser,
  repo: BaseRepo<User, RequestCreateUser, RequestUpdateUser>
): Promise<IUser> => {
  const document = await repo.create(payload);
  return document.serialize();
};
