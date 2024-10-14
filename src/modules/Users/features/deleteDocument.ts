import {
  IUser,
  UserDataRepository
} from '@src/modules/Users';

export const deleteDocument = async (
  userId: string,
  documentId: string,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.deleteDocument(userId, documentId);
  return model.serialize();
};
