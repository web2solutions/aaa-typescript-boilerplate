/* eslint-disable no-underscore-dangle */
// import * as bcrypt from 'bcrypt';
import { BaseModel } from '@src/domains/ports/persistence/BaseModel';
import {
  canNotBeEmpty,
  throwIfReadOnly
  // mustBePassword
} from '@src/domains/validators';
import {
  EmailValueObject,
  DocumentValueObject,
  PhoneValueObject
} from '@src/domains/valueObjects';
import {
  IUser,
  RequestCreateUser,
  RequestCreatePhone,
  RequestUpdatePhone,
  RequestCreateDocument,
  RequestUpdateDocument,
  RequestCreateEmail,
  RequestUpdateEmail
} from '../index';

interface UserFactory extends RequestCreateUser {
  id?: string;
  readOnly?: boolean;
  active?: boolean;
}

export class User extends BaseModel<IUser> implements IUser {
  private _firstName: string = '';

  private _lastName: string = '';

  private _username: string = '';

  private _password: string = '';

  private _salt: string = '';

  private _avatar: string = 'avatar.png';

  private _emails: EmailValueObject[] = [];

  private _documents: DocumentValueObject[] = [];

  private _phones: PhoneValueObject[] = [];

  private _roles: string[] = [];

  private _readOnly: boolean = false;

  public _excludeOnSerialize: string[] = ['login'];

  public _active: boolean = true;

  constructor(payload: UserFactory) {
    super(payload.id);
    const {
      firstName,
      lastName,
      avatar,
      username,
      password,
      salt,
      emails,
      documents,
      phones,
      roles,
      readOnly
    } = payload;

    this.firstName = firstName;
    this.lastName = lastName ?? '';
    this.avatar = avatar ?? 'avatar.png';
    this.username = username;
    this.password = password || '';
    this.salt = salt ?? '';

    emails.forEach((e) => this.createEmail(e));
    documents?.forEach((d) => this.createDocument(d));
    phones?.forEach((p) => this.createPhone(p));
    this._roles = [...(roles || [])];

    this._readOnly = readOnly ?? false;

    this._excludeOnSerialize = [
      'createPhone',
      'updatePhone',
      'deletePhone',
      'createDocument',
      'updateDocument',
      'deleteDocument',
      'createEmail',
      'updateEmail',
      'deleteEmail'
    ];
  }

  public get firstName(): string {
    return this._firstName;
  }

  public set firstName(firstName: string) {
    throwIfReadOnly('firstName', this._readOnly);
    canNotBeEmpty('firstName', firstName);
    this._firstName = firstName;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public set lastName(lastName: string) {
    throwIfReadOnly('lastName', this._readOnly);
    this._lastName = lastName;
  }

  public get avatar(): string {
    return this._avatar;
  }

  public set avatar(avatar: string) {
    throwIfReadOnly('avatar', this._readOnly);
    canNotBeEmpty('avatar', avatar);
    this._avatar = avatar;
  }

  public createPhone(payload: RequestCreatePhone): boolean {
    throwIfReadOnly('phone', this._readOnly);
    this._phones.push(new PhoneValueObject(payload));
    return true;
  }

  public updatePhone(payload: RequestUpdatePhone): boolean {
    throwIfReadOnly('phone', this._readOnly);
    for (let i = 0; i < this._phones.length; i += 1) {
      if (this._phones[i].id === payload.id) {
        this._phones[i] = new PhoneValueObject({ ...this._phones[i], ...payload });
        return true;
      }
    }
    return false;
  }

  public deletePhone(id: string): boolean {
    throwIfReadOnly('phone', this._readOnly);
    for (let i = 0; i < this._phones.length; i += 1) {
      if (this._phones[i].id === id) {
        this._phones.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  public createDocument(payload: RequestCreateDocument): boolean {
    throwIfReadOnly('document', this._readOnly);
    this._documents.push(new DocumentValueObject(payload));
    return true;
  }

  public updateDocument(payload: RequestUpdateDocument): boolean {
    throwIfReadOnly('document', this._readOnly);
    for (let i = 0; i < this._documents.length; i += 1) {
      if (this._documents[i].id === payload.id) {
        this._documents[i] = new DocumentValueObject({ ...this._documents[i], ...payload });
        return true;
      }
    }
    return false;
  }

  public deleteDocument(id: string): boolean {
    throwIfReadOnly('document', this._readOnly);
    for (let i = 0; i < this._documents.length; i += 1) {
      if (this._documents[i].id === id) {
        this._documents.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  public createEmail(payload: RequestCreateEmail): boolean {
    throwIfReadOnly('email', this._readOnly);
    this._emails.push(new EmailValueObject(payload));
    return true;
  }

  public updateEmail(payload: RequestUpdateEmail): boolean {
    throwIfReadOnly('email', this._readOnly);
    for (let i = 0; i < this._emails.length; i += 1) {
      if (this._emails[i].id === payload.id) {
        this._emails[i] = new EmailValueObject({ ...this._emails[i], ...payload });
        return true;
      }
    }
    return false;
  }

  public deleteEmail(id: string): boolean {
    throwIfReadOnly('email', this._readOnly);
    for (let i = 0; i < this._emails.length; i += 1) {
      if (this._emails[i].id === id) {
        this._emails.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  public get username(): string {
    return this._username;
  }

  public set username(username: string) {
    throwIfReadOnly('username', this._readOnly);
    canNotBeEmpty('username', username);
    this._username = username;
  }

  public get password(): string {
    return this._password;
  }

  public set password(password: string) {
    throwIfReadOnly('password', this._readOnly);
    if (password === '') return;
    // canNotBeEmpty('password', password);
    // mustBePassword('password', password);
    this._password = password;
  }

  public get salt(): string {
    return this._salt;
  }

  public set salt(salt: string) {
    throwIfReadOnly('salt', this._readOnly);
    if (salt === '') return;
    this._salt = salt;
  }

  public get roles(): string[] {
    return [...this._roles];
  }

  public get emails(): EmailValueObject[] {
    return [...this._emails];
  }

  public get documents(): DocumentValueObject[] {
    return [...this._documents];
  }

  public get phones(): PhoneValueObject[] {
    return [...this._phones];
  }
}
