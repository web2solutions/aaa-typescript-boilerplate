import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { RequestCreateUser } from '@src/modules/Users/interface/dto/RequestCreateUser';
import { IUserRepository } from '@src/modules/Users/service/ports/IUserRepository';

export const createUser = async (
  payload: RequestCreateUser,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.create(payload);
  const rawDoc = { ...model.serialize() };
  delete (rawDoc as any).password;
  delete (rawDoc as any).salt;
  return rawDoc;
};
