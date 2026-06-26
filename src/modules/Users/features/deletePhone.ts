import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';

export const deletePhone = async (
  userId: string,
  phoneId: string,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.deletePhone(userId, phoneId);
  return model.serialize();
};
