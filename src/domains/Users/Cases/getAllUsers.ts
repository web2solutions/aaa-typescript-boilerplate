import {
  IUser,
  UserDataRepository
} from '@src/domains/Users';

export const getAllUsers = async (
  repo: UserDataRepository
): Promise<IUser[]> => {
  const users = await repo.getAll();
  return users;
};
