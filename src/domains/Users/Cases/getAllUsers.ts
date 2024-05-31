import {
  IUser,
  UserDataRepository
} from '@src/domains/Users';

export const getAllUsers = async (
  userDataRepository: UserDataRepository
): Promise<IUser[]> => {
  const users = await userDataRepository.getAll();
  return users;
};
