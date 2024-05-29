import { IUser, UserDataRepository } from '@src/domains/Users';
// import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';

export const getAllUsers = async (
  repoUser: UserDataRepository
): Promise<IUser[]> => {
  const users = await repoUser.getAll();
  return users;
};
