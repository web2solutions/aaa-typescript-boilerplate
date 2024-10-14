import { IStore } from '@src/infra/ports/persistence/IStore';
import {
  throwIfPreUpdateValidationFails,
  throwIfNotFound,
  // throwIfValuesAreDifferent,
  canNotBeEmpty
} from '@src/shared/validators';
import {
  IUser,
  User,
  RequestCreateUser,
  RequestUpdateUser,
  RequestUpdatePassword,
  RequestCreateDocument,
  RequestUpdateDocument,
  RequestUpdatePhone,
  RequestCreatePhone,
  RequestUpdateEmail,
  RequestCreateEmail
} from '@src/modules/Users';
import {
  IPagingRequest, IPagingResponse, IRepoConfig, BaseRepo
} from '@src/modules/port';

import { _DEFAULT_PAGE_SIZE_ } from '@src/config/constants';

export function exclude<T, Key extends keyof T>(
  record: T,
  keys: Key[]
): Omit<T, Key> {
  for (const key of keys) {
    // eslint-disable-next-line no-param-reassign
    delete record[key];
  }
  return record;
}

let userDataRepository: any;

export class UserDataRepository extends BaseRepo<User, RequestCreateUser, RequestUpdateUser> {
  public store: IStore<IUser>;

  public limit: number;

  public constructor(config: IRepoConfig) {
    super(config);
    const { limit } = config;
    this.store = this.databaseClient.stores.User;
    this.limit = limit ?? _DEFAULT_PAGE_SIZE_;
  }

  public async create(data: RequestCreateUser): Promise<User> {
    canNotBeEmpty('password', data.password);
    // hash password
    const model: User = new User(data);
    await this.store.create(model.id, model.serialize());
    model.password = '********';
    model.salt = '***';

    return model;
  }

  public async update(id: string, data: RequestUpdateUser): Promise<User> {
    throwIfPreUpdateValidationFails(id, data);
    // const rawUser = await this.store.getOneById(id);
    // throwIfNotFound(!!rawUser);
    const newData = { ...(new User({ ...data, password: '' })).serialize() };
    delete (newData as any).password;
    delete (newData as any).salt;
    // const model: User = new User({
    //  ...rawUser,
    //  ...newData
    // });
    // const rawNewDoc = { ...model.serialize() };
    // delete (rawNewDoc as any).password;
    // delete (rawNewDoc as any).salt;
    // console.log('newData', newData)
    const updatedDoc = await this.store.update(id, newData as IUser);
    // console.log('updatedDoc', updatedDoc)
    return new User(updatedDoc);
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

  public async getAll(
    filters: Record<string, string|number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<User[]>> {
    const {
      result, page, size, total
    } = await this.store.getAll(filters, paging);
    const pagedResponse: IPagingResponse<User[]> = {
      page,
      size,
      total,
      result: result.map((rawDoc: IUser) => new User(rawDoc))
    };
    return pagedResponse;
  }

  public static compile(config: IRepoConfig): UserDataRepository {
    if (userDataRepository) return userDataRepository;
    userDataRepository = new UserDataRepository(config);
    return userDataRepository;
  }

  public async updatePassword(id: string, data: RequestUpdatePassword): Promise<User> {
    const oldDocument = await this.getOneById(id);
    canNotBeEmpty('password', data.password);
    // throwIfValuesAreDifferent([oldDocument.password, data.oldPassword]);
    const model: User = new User({ ...oldDocument.serialize() });
    model.password = data.password;
    model.salt = data.salt!;
    await this.store.update(id, model.serialize());
    return model;
  }

  public async createDocument(userId: string, data: RequestCreateDocument): Promise<User> {
    const oldDocument = await this.getOneById(userId);
    const model: User = new User({ ...oldDocument.serialize() });
    model.createDocument(data);
    await this.store.update(userId, model.serialize());
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
    await this.store.update(userId, model.serialize());
    return model;
  }

  public async deleteDocument(
    userId: string,
    documentId: string
  ): Promise<User> {
    const oldDocument = await this.getOneById(userId);
    const model: User = new User({ ...oldDocument.serialize() });
    model.deleteDocument(documentId);
    await this.store.update(userId, model.serialize());
    return model;
  }

  //
  public async createPhone(userId: string, data: RequestCreatePhone): Promise<User> {
    const oldPhone = await this.getOneById(userId);
    const model: User = new User({ ...oldPhone.serialize() });
    model.createPhone(data);
    await this.store.update(userId, model.serialize());
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
    await this.store.update(userId, model.serialize());
    return model;
  }

  public async deletePhone(
    userId: string,
    phoneId: string
  ): Promise<User> {
    const oldPhone = await this.getOneById(userId);
    const model: User = new User({ ...oldPhone.serialize() });
    model.deletePhone(phoneId);
    await this.store.update(userId, model.serialize());
    return model;
  }

  // Email
  public async createEmail(userId: string, data: RequestCreateEmail): Promise<User> {
    const oldEmail = await this.getOneById(userId);
    const model: User = new User({ ...oldEmail.serialize() });
    model.createEmail(data);
    await this.store.update(userId, model.serialize());
    return model;
  }

  public async updateEmail(
    userId: string,
    emailId: string,
    data: RequestUpdateEmail
  ): Promise<User> {
    const oldEmail = await this.getOneById(userId);
    const model: User = new User({ ...oldEmail.serialize() });
    model.updateEmail({ ...data, id: emailId });
    await this.store.update(userId, model.serialize());
    return model;
  }

  public async deleteEmail(
    userId: string,
    emailId: string
  ): Promise<User> {
    const oldEmail = await this.getOneById(userId);
    const model: User = new User({ ...oldEmail.serialize() });
    model.deleteEmail(emailId);
    await this.store.update(userId, model.serialize());
    return model;
  }
}
