import {
  IUser,
  UserDataRepository,
  RequestUpdatePassword
} from '@src/domains/Users';

export const updatePassword = async (
  id: string,
  payload: RequestUpdatePassword,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.updatePassword(id, payload);
  return model.serialize();
};
