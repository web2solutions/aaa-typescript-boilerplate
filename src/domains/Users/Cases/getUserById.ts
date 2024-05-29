import {
  IUser,
  UserDataRepository
} from '@src/domains/Users';

export const getUserById = async (
  id: string,
  repo: UserDataRepository
): Promise<IUser> => {
  const model = await repo.getOneById(id);
  return model.serialize();
};
