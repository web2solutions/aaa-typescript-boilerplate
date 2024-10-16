import {
  IUser,
  UserDataRepository,
  RequestUpdateUser
} from '@src/modules/Users';

export const updateUser = async (
  id: string,
  payload: RequestUpdateUser,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const document = await userDataRepository.update(id, payload);
  return document.serialize();
};
