import {
  IUser,
  IUserRepository
} from '@src/modules/Users';

export const deletePhone = async (
  userId: string,
  phoneId: string,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.deletePhone(userId, phoneId);
  return model.serialize();
};
