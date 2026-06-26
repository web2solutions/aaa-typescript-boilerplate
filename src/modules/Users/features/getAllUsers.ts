import {
  IUser,
  User,
  IUserRepository
} from '@src/modules/Users';
import { IPagingRequest, IPagingResponse } from '@src/modules/port';

export const getAllUsers = async (
  filters: Record<string, string|number>,
  paging: IPagingRequest,
  userDataRepository: IUserRepository
): Promise<IPagingResponse<IUser[]>> => {
  const response = await userDataRepository.getAll({ ...filters }, paging);
  const rawDocs: IUser[] = response.result.map(
    (model: User) => model.serialize()
  );
  return {
    ...response,
    result: rawDocs
  };
};
