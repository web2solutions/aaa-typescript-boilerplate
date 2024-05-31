import {
  IUser,
  UserDataRepository,
  RequestCreateDocument
} from '@src/domains/Users';

export const createDocument = async (
  userId: string,
  payload: RequestCreateDocument,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.createDocument(userId, payload);
  return model.serialize();
};
