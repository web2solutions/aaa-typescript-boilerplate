import {
  IUser,
  UserDataRepository,
  RequestCreateDocument
} from '@src/modules/Users/';

export const createDocument = async (
  userId: string,
  payload: RequestCreateDocument,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.createDocument(userId, payload);
  return model.serialize();
};
