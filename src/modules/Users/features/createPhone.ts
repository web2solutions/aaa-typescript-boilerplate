import {
  IUser,
  UserDataRepository,
  RequestCreatePhone
} from '@src/modules/Users';

export const createPhone = async (
  userId: string,
  payload: RequestCreatePhone,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.createPhone(userId, payload);
  return model.serialize();
};
