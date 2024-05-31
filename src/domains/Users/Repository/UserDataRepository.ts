import { IStore } from '@src/domains/ports/persistence/IStore';
import { BaseRepo } from '@src/domains/ports/persistence/BaseRepo';
import { IRepoConfig } from '@src/domains/ports/persistence/IRepoConfig';
import { throwIfPreUpdateValidationFails, throwIfNotFound } from '@src/domains/validators';
import {
  IUser,
  User,
  RequestCreateUser,
  RequestUpdateUser,
  RequestUpdateLogin,
  RequestCreateDocument,
  RequestUpdateDocument,
  RequestUpdatePhone,
  RequestCreatePhone
} from '@src/domains/Users';

let userDataRepository: any;

export class UserDataRepository extends BaseRepo<User, RequestCreateUser, RequestUpdateUser> {
  public store: IStore<IUser>;

  public limit: number;

  public constructor(config: IRepoConfig) {
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

  public async updateLogin(id: string, data: RequestUpdateLogin): Promise<User> {
    const oldDocument = await this.getOneById(id);
    const model: User = new User({ ...oldDocument.serialize() });
    model.login = { ...data };
    await this.store.update(id, model.serialize() as IUser);
    return model;
  }

  public async createDocument(userId: string, data: RequestCreateDocument): Promise<User> {
    const oldDocument = await this.getOneById(userId);
    const model: User = new User({ ...oldDocument.serialize() });
    model.createDocument(data);
    await this.store.update(userId, model.serialize() as IUser);
    return model;
  }

  public async updateDocument(
    userId: string,
    documentId: string,
    data: RequestUpdateDocument
  ): Promise<User> {
    const oldDocument = await this.getOneById(userId);
    const model: User = new User({ ...oldDocument.serialize() });
    model.updateDocument({ ...data, id: documentId });
    await this.store.update(userId, model.serialize() as IUser);
    return model;
  }

  public async deleteDocument(
    userId: string,
    documentId: string
  ): Promise<User> {
    const oldDocument = await this.getOneById(userId);
    const model: User = new User({ ...oldDocument.serialize() });
    model.deleteDocument(documentId);
    await this.store.update(userId, model.serialize() as IUser);
    return model;
  }

  //
  public async createPhone(userId: string, data: RequestCreatePhone): Promise<User> {
    const oldPhone = await this.getOneById(userId);
    const model: User = new User({ ...oldPhone.serialize() });
    model.createPhone(data);
    await this.store.update(userId, model.serialize() as IUser);
    return model;
  }

  public async updatePhone(
    userId: string,
    phoneId: string,
    data: RequestUpdatePhone
  ): Promise<User> {
    const oldPhone = await this.getOneById(userId);
    const model: User = new User({ ...oldPhone.serialize() });
    model.updatePhone({ ...data, id: phoneId });
    await this.store.update(userId, model.serialize() as IUser);
    return model;
  }

  public async deletePhone(
    userId: string,
    phoneId: string
  ): Promise<User> {
    const oldPhone = await this.getOneById(userId);
    const model: User = new User({ ...oldPhone.serialize() });
    model.deletePhone(phoneId);
    await this.store.update(userId, model.serialize() as IUser);
    return model;
  }
}
