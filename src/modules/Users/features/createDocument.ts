import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';
import { RequestCreateDocument } from '@src/modules/Users/interface/dto/RequestCreateDocument';

export const createDocument = async (
  userId: string,
  payload: RequestCreateDocument,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.createDocument(userId, payload);
  return model.serialize();
};
