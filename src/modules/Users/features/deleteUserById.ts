import {
  UserDataRepository
} from '@src/modules/Users';

export const deleteUserById = async (
  id: string,
  userDataRepository: UserDataRepository
): Promise<boolean> => {
  await userDataRepository.delete(id);
  return true;
};
