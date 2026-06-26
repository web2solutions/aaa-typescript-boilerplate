import {
  IUser,
  IUserRepository,
  RequestUpdatePhone
} from '@src/modules/Users';

export const updatePhone = async (
  userId: string,
  documentId: string,
  payload: RequestUpdatePhone,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.updatePhone(userId, documentId, payload);
  return model.serialize();
};
