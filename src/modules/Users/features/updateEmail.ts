import {
  IUser,
  IUserRepository,
  RequestUpdateEmail
} from '@src/modules/Users';

export const updateEmail = async (
  userId: string,
  documentId: string,
  payload: RequestUpdateEmail,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.updateEmail(userId, documentId, payload);
  return model.serialize();
};
