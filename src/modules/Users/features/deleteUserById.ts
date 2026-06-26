import {
  IUserRepository
} from '@src/modules/Users';

export const deleteUserById = async (
  id: string,
  userDataRepository: IUserRepository
): Promise<boolean> => {
  await userDataRepository.delete(id);
  return true;
};
