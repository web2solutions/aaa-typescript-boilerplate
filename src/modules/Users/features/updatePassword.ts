import {
  IUser,
  IUserRepository,
  RequestUpdatePassword
} from '@src/modules/Users';

export const updatePassword = async (
  id: string,
  payload: RequestUpdatePassword,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.updatePassword(id, payload);
  return model.serialize();
};
