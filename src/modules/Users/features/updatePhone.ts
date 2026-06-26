import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';

export const updatePhone = async (
  userId: string,
  documentId: string,
  payload: RequestUpdatePhone,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.updatePhone(userId, documentId, payload);
  return model.serialize();
};
