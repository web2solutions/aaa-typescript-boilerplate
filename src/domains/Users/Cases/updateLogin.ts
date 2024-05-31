import {
  IUser,
  UserDataRepository,
  RequestUpdateLogin
} from '@src/domains/Users';

export const updateLogin = async (
  id: string,
  payload: RequestUpdateLogin,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.updateLogin(id, payload);
  return model.serialize();
};
