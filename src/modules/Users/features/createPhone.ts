import {
  IUser,
  IUserRepository,
  RequestCreatePhone
} from '@src/modules/Users';

export const createPhone = async (
  userId: string,
  payload: RequestCreatePhone,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.createPhone(userId, payload);
  return model.serialize();
};
