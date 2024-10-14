import {
  IUser,
  UserDataRepository
} from '@src/modules/Users';

export const deletePhone = async (
  userId: string,
  phoneId: string,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.deletePhone(userId, phoneId);
  return model.serialize();
};
