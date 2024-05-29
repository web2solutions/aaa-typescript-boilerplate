import {
  IUser,
  UserDataRepository,
  RequestUpdateUser
} from '@src/domains/Users';

export const updateUser = async (
  id: string,
  payload: RequestUpdateUser,
  repo: UserDataRepository
): Promise<IUser> => {
  const document = await repo.update(id, payload);
  return document.serialize();
};
