import {
  IUser,
  UserDataRepository,
  RequestUpdatePhone
} from '@src/domains/Users';

export const updatePhone = async (
  userId: string,
  documentId: string,
  payload: RequestUpdatePhone,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.updatePhone(userId, documentId, payload);
  return model.serialize();
};
