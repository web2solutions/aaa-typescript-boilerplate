import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';
import { RequestUpdateDocument } from '@src/modules/Users/interface/dto/RequestUpdateDocument';

export const updateDocument = async (
  userId: string,
  documentId: string,
  payload: RequestUpdateDocument,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.updateDocument(userId, documentId, payload);
  return model.serialize();
};
