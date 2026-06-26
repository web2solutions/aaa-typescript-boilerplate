import {
  IUser,
  IUserRepository,
  RequestUpdateDocument
} from '@src/modules/Users';

export const updateDocument = async (
  userId: string,
  documentId: string,
  payload: RequestUpdateDocument,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.updateDocument(userId, documentId, payload);
  return model.serialize();
};
