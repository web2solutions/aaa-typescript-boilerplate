import {
  IUser,
  IUserRepository
} from '@src/modules/Users';

export const getUserById = async (
  id: string,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.getOneById(id);
  return model.serialize();
};
