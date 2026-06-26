import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';
import { RequestUpdateUser } from '@src/modules/Users/interface/dto/RequestUpdateUser';

export const updateUser = async (
  id: string,
  payload: RequestUpdateUser,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const document = await userDataRepository.update(id, payload);
  return document.serialize();
};
