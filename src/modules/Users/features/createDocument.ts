import {
  IUser,
  IUserRepository,
  RequestCreateDocument
} from '@src/modules/Users/';

export const createDocument = async (
  userId: string,
  payload: RequestCreateDocument,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.createDocument(userId, payload);
  return model.serialize();
};
