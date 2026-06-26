import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';

export const deleteUserById = async (
  id: string,
  userDataRepository: IUserRepository
): Promise<boolean> => {
  await userDataRepository.delete(id);
  return true;
};
