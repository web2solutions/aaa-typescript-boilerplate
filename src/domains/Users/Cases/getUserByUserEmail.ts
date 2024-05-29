import { User, UserDataRepository } from '@src/domains/Users';
// import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';

export const getUserByUserEmail = async (
  userEmail: string,
  repo: UserDataRepository
): Promise<User> => {
  try {
    const model = await repo.getByUserEmail(userEmail);
    return Promise.resolve(model);
  } catch (err) {
    return Promise.reject(err);
  }
};
