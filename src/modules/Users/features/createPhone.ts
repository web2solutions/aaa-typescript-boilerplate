import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';

export const createPhone = async (
  userId: string,
  payload: RequestCreatePhone,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.createPhone(userId, payload);
  return model.serialize();
};
