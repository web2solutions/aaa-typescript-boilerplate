import {
  IUser,
  UserDataRepository
} from '@src/domains/Users';

export const deleteEmail = async (
  userId: string,
  emailId: string,
  userDataRepository: UserDataRepository
): Promise<IUser> => {
  const model = await userDataRepository.deleteEmail(userId, emailId);
  return model.serialize();
};
