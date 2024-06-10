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
  const rawDoc = { ...model.serialize() };
  delete (rawDoc as any).password;
  delete (rawDoc as any).salt;
  return rawDoc;
};
