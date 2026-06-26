import {
  IUser,
  IUserRepository
} from '@src/modules/Users';

export const deleteDocument = async (
  userId: string,
  documentId: string,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.deleteDocument(userId, documentId);
  return model.serialize();
};
