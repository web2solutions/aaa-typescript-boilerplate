import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';

export const getUserById = async (
  id: string,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.getOneById(id);
  return model.serialize();
};
