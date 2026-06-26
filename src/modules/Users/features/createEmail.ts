import {
  IUser,
  IUserRepository,
  RequestCreateEmail
} from '@src/modules/Users';

export const createEmail = async (
  userId: string,
  payload: RequestCreateEmail,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.createEmail(userId, payload);
  return model.serialize();
};
