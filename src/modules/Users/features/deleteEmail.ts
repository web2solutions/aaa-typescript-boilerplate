import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';

export const deleteEmail = async (
  userId: string,
  emailId: string,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.deleteEmail(userId, emailId);
  return model.serialize();
};
