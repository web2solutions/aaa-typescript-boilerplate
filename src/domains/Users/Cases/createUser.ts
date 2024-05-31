import {
  IUser,
  RequestCreateUser,
  UserDataRepository
} from '@src/domains/Users';

export const createUser = async (
  payload: RequestCreateUser,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.create(payload);
  return model.serialize();
};
