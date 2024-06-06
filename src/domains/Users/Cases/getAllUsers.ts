import {
  IUser,
  User,
  UserDataRepository
} from '@src/domains/Users';
import { IPagingRequest } from '@src/domains/ports/persistence/IPagingRequest';
import { IPagingResponse } from '@src/domains/ports/persistence/IPagingResponse';

export const getAllUsers = async (
  filters: Record<string, string|number>,
  paging: IPagingRequest,
  userDataRepository: UserDataRepository
): Promise<IPagingResponse<IUser[]>> => {
  const response = await userDataRepository.getAll({ ...filters }, paging);
  const rawDocs: IUser[] = response.result.map(
    (model: User) => model.serialize()
  ) as IUser[];
  return {
    ...response,
    result: rawDocs as IUser[]
  };
};
