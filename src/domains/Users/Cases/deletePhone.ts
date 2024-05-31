import {
  IUser,
  UserDataRepository
} from '@src/domains/Users';

export const deletePhone = async (
  userId: string,
  phoneId: string,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.deletePhone(userId, phoneId);
  return model.serialize();
};
