import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';

export const deleteDocument = async (
  userId: string,
  documentId: string,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.deleteDocument(userId, documentId);
  return model.serialize();
};
