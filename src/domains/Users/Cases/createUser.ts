import {
  IUser,
  RequestCreateUser,
  UserDataRepository
} from '@src/domains/Users';

export const createUser = async (
  payload: RequestCreateUser,
  repo: UserDataRepository
): Promise<IUser> => {
  const document = await repo.create(payload);
  return document.serialize();
};
