import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';

export const createEmail = async (
  userId: string,
  payload: RequestCreateEmail,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.createEmail(userId, payload);
  return model.serialize();
};
