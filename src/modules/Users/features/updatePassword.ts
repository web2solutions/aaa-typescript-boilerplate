import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';
import { RequestUpdatePassword } from '@src/modules/Users/interface/dto/RequestUpdatePassword';

export const updatePassword = async (
  id: string,
  payload: RequestUpdatePassword,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.updatePassword(id, payload);
  return model.serialize();
};
