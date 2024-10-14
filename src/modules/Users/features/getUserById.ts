import {
  IUser,
  UserDataRepository
} from '@src/modules/Users';

export const getUserById = async (
  id: string,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.getOneById(id);
  return model.serialize();
};
