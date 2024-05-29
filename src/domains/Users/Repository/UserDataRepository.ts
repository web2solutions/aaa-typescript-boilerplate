import { IStore } from '@src/domains/ports/persistence/IStore';
import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';
import { IRepoConfig } from '@src/domains/ports/persistence/IRepoConfig';
import { throwIfNotFound } from '@src/domains/validators';
import { IUser, User } from '..';

let userDataRepository: any;

export class UserDataRepository extends BaseRepo<User> {
  public store: IStore<IUser>;

  public limit: number;

  // private dbClient: IDbClient;
  private constructor(config: IRepoConfig) {
    super(config);
    const { limit } = config;
    // this.dbClient = dbClient;
    // points to a collection or table
    this.store = this.dbClient.stores.User as IStore<IUser>;
    this.limit = limit ?? 30;
  }

  public async create(data: User): Promise<User> {
    try {
      await this.store.create(data.id, data.serialize() as unknown as IUser);
      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async update(id: string, data: User): Promise<User> {
    await this.store.update(id, data.serialize() as unknown as IUser);
    return data;
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await this.store.delete(id);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getOneById(id: string): Promise<User> {
    try {
      const rawUser = await this.store.getOneById(id);
      throwIfNotFound(!!rawUser);
      return Promise.resolve(new User({ ...rawUser, readOnly: true }));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getByUserEmail(userEmail: string): Promise<User> {
    try {
      if (!this.store.getByUserEmail) return Promise.reject(new Error('getByUserEmail - not implemented'));
      const rawUser = await this.store.getByUserEmail(userEmail);
      throwIfNotFound(!!rawUser);
      return Promise.resolve(new User({ ...rawUser, readOnly: true }));
    } catch (error) {
      return Promise.reject(error);
    }
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
