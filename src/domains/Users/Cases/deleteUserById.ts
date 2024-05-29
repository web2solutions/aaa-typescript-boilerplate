import {
  UserDataRepository
} from '@src/domains/Users';

export const deleteUserById = async (
  id: string,
  repo: UserDataRepository
): Promise<boolean> => {
  await repo.delete(id);
  return true;
};
