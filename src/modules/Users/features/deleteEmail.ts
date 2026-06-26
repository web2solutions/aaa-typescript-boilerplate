import {
  IUser,
  IUserRepository
} from '@src/modules/Users';

export const deleteEmail = async (
  userId: string,
  emailId: string,
  userDataRepository: IUserRepository
): Promise<IUser> => {
  const model = await userDataRepository.deleteEmail(userId, emailId);
  return model.serialize();
};
