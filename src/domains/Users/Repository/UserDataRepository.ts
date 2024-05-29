import { IStore } from '@src/domains/ports/persistence/IStore';
import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';
import { IRepoConfig } from '@src/domains/ports/persistence/IRepoConfig';
import { throwIfPreUpdateValidationFails, throwIfNotFound } from '@src/domains/validators';
import {
  IUser,
  User,
  RequestCreateUser,
  RequestUpdateUser
} from '..';

let userDataRepository: any;

export class UserDataRepository extends BaseRepo<User, RequestCreateUser, RequestUpdateUser> {
  public store: IStore<IUser>;

  public limit: number;

  private constructor(config: IRepoConfig) {
    super(config);
    const { limit } = config;
    this.store = this.dbClient.stores.User as IStore<IUser>;
    this.limit = limit ?? 30;
  }

  public async create(data: RequestCreateUser): Promise<User> {
    const model: User = new User(data);
    await this.store.create(model.id, model.serialize() as IUser);
    return model;
  }

  public async update(id: string, data: RequestUpdateUser): Promise<User> {
    throwIfPreUpdateValidationFails(id, data);
    const oldDocument = await this.getOneById(id);
    const model: User = new User({ ...oldDocument.serialize(), ...data });
    await this.store.update(id, model.serialize() as IUser);
    return model;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.store.delete(id);
    return result;
  }

  public async getOneById(id: string): Promise<User> {
    const rawUser = await this.store.getOneById(id);
    throwIfNotFound(!!rawUser);
    return new User({ ...rawUser, readOnly: true });
  }

  public async getAll(page = 1): Promise<User[]> {
    const result = await this.store.getAll(page, this.limit);
    return result as unknown as User[];
  }

  public static compile(config: IRepoConfig): UserDataRepository {
    if (userDataRepository) return userDataRepository;
    userDataRepository = new UserDataRepository(config);
    return userDataRepository;
  }
}
