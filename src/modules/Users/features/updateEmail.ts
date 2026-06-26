import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';

export const updateEmail = async (
  userId: string,
  documentId: string,
  payload: RequestUpdateEmail,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.updateEmail(userId, documentId, payload);
  return model.serialize();
};
