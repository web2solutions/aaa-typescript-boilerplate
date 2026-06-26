import { UserService } from '@src/modules/Users/service/UserService';
import { IUserUseCases } from '@src/modules/Users/application/ports/IUserUseCases';

export class UserUseCases implements IUserUseCases {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async create(data: Parameters<UserService['create']>[0]) {
    return this.userService.create(data);
  }

  public async update(id: string, data: Parameters<UserService['update']>[1]) {
    return this.userService.update(id, data);
  }

  public async delete(id: string) {
    return this.userService.delete(id);
  }

  public async getOneById(id: string) {
    return this.userService.getOneById(id);
  }

  public async getAll(
    filters: Parameters<UserService['getAll']>[0],
    paging: Parameters<UserService['getAll']>[1]
  ) {
    return this.userService.getAll(filters, paging);
  }

  public async updatePassword(id: string, data: Parameters<UserService['updatePassword']>[1]) {
    return this.userService.updatePassword(id, data);
  }

  public async createDocument(id: string, data: Parameters<UserService['createDocument']>[1]) {
    return this.userService.createDocument(id, data);
  }

  public async updateDocument(
    id: string,
    documentId: string,
    data: Parameters<UserService['updateDocument']>[2]
  ) {
    return this.userService.updateDocument(id, documentId, data);
  }

  public async deleteDocument(id: string, documentId: string) {
    return this.userService.deleteDocument(id, documentId);
  }

  public async createPhone(id: string, data: Parameters<UserService['createPhone']>[1]) {
    return this.userService.createPhone(id, data);
  }

  public async updatePhone(id: string, phoneId: string, data: Parameters<UserService['updatePhone']>[2]) {
    return this.userService.updatePhone(id, phoneId, data);
  }

  public async deletePhone(id: string, phoneId: string) {
    return this.userService.deletePhone(id, phoneId);
  }

  public async createEmail(id: string, data: Parameters<UserService['createEmail']>[1]) {
    return this.userService.createEmail(id, data);
  }

  public async updateEmail(id: string, emailId: string, data: Parameters<UserService['updateEmail']>[2]) {
    return this.userService.updateEmail(id, emailId, data);
  }

  public async deleteEmail(id: string, emailId: string) {
    return this.userService.deleteEmail(id, emailId);
  }

  public static compile(userService: UserService): IUserUseCases {
    return new UserUseCases(userService);
  }
}
