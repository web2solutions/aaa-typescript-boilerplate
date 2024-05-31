import {
  IUser,
  UserDataRepository,
  RequestUpdateDocument
} from '@src/domains/Users';

export const updateDocument = async (
  userId: string,
  documentId: string,
  payload: RequestUpdateDocument,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.updateDocument(userId, documentId, payload);
  return model.serialize();
};
