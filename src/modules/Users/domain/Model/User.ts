/* eslint-disable no-underscore-dangle */
// import * as bcrypt from 'bcrypt';
import {
  BaseModel
} from '@src/modules/port';
import {
  canNotBeEmpty,
  throwIfReadOnly
  // mustBePassword
} from '@src/shared/validators';
import {
  EmailValueObject,
  DocumentValueObject,
  PhoneValueObject
} from '@src/modules/ddd/valueObjects';
import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { RequestCreateUser } from '@src/modules/Users/interface/dto/RequestCreateUser';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';
import { RequestCreateDocument } from '@src/modules/Users/interface/dto/RequestCreateDocument';
import { RequestUpdateDocument } from '@src/modules/Users/interface/dto/RequestUpdateDocument';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';
import { DomainValidationError } from '@src/infra/exceptions';
import {
  normalizeRoles,
  shouldRequireOrganization
} from '@src/modules/Users/domain/security/Rbac';

interface UserFactory extends RequestCreateUser {
  id?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  readOnly?: boolean;
  active?: boolean;
}

export class User extends BaseModel<IUser> implements IUser {
  public static readonly dataEntitySchema = {
    name: 'User',
    fields: [
      {
        name: 'id',
        type: 'string',
        format: 'uuid',
        required: true,
        validations: ['pattern:^[0-9a-fA-F-]{36}$']
      },
      {
        name: 'createdAt',
        type: 'string',
        format: 'date-time',
        required: true,
        validations: []
      },
      {
        name: 'updatedAt',
        type: 'string',
        format: 'date-time',
        required: true,
        validations: []
      },
      {
        name: 'firstName',
        type: 'string',
        required: true,
        validations: ['minLength:1']
      },
      {
        name: 'lastName',
        type: 'string',
        validations: []
      },
      {
        name: 'avatar',
        type: 'string',
        format: 'none',
        validations: []
      },
      {
        name: 'username',
        type: 'string',
        required: true,
        validations: ['minLength:1']
      },
      {
        name: 'organization',
        type: 'string',
        format: 'uuid',
        required: false,
        validations: []
      },
      {
        name: 'password',
        type: 'string',
        format: 'password',
        required: false,
        validations: []
      },
      {
        name: 'salt',
        type: 'string',
        required: false,
        validations: []
      },
      {
        name: 'roles',
        type: 'array',
        required: false,
        validations: []
      },
      {
        name: 'emails',
        type: 'array',
        required: false,
        validations: []
      },
      {
        name: 'documents',
        type: 'array',
        required: false,
        validations: []
      },
      {
        name: 'phones',
        type: 'array',
        required: false,
        validations: []
      }
    ]
  } as const;

  private _firstName: string = '';

  private _lastName: string = '';

  private _username: string = '';

  private _password: string = '';

  private _salt: string = '';

  private _organization: string = '';

  private _avatar: string = 'avatar.png';

  private _emails: EmailValueObject[] = [];

  private _documents: DocumentValueObject[] = [];

  private _phones: PhoneValueObject[] = [];

  private readonly _roles: string[] = [];

  private readonly _readOnly: boolean = false;

  public _excludeOnSerialize: string[] = ['login'];

  public _active: boolean = true;

  private _skipDomainValidation: boolean = true;

  constructor(payload: UserFactory) {
    super({
      id: payload.id,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt
    });
    BaseModel.throwIfDataEntitySchemaIsNotOpenApi31Compliant(User.dataEntitySchema as any);
    const {
      firstName,
      lastName,
      avatar,
      username,
      organization,
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
    this.organization = organization ?? '';
    this.password = password || '';
    this.salt = salt ?? '';

    emails.forEach((e) => this.createEmail(e));
    documents?.forEach((d) => this.createDocument(d));
    phones?.forEach((p) => this.createPhone(p));
    this._roles = normalizeRoles(roles || []);

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

    this._skipDomainValidation = false;
    this.validateDomainState();
  }

  private validateDomainState(): void {
    if (this._skipDomainValidation) return;
    this.ensureTenancyRules();
    const payload: Record<string, any> = {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      firstName: this.firstName,
      lastName: this.lastName,
      avatar: this.avatar,
      username: this.username,
      password: this.password,
      salt: this.salt,
      roles: this.roles,
      emails: this.emails.map((entry) => ({ ...entry })),
      documents: this.documents.map((entry) => ({ ...entry })),
      phones: this.phones.map((entry) => ({ ...entry }))
    };
    if (this.organization) payload.organization = this.organization;
    BaseModel.throwIfModelPayloadIsNotOpenApi31Compliant(
      payload,
      User.dataEntitySchema as any
    );
  }

  public get firstName(): string {
    return this._firstName;
  }

  public set firstName(firstName: string) {
    throwIfReadOnly('firstName', this._readOnly);
    canNotBeEmpty('firstName', firstName);
    this._firstName = firstName;
    this.validateDomainState();
  }

  public get lastName(): string {
    return this._lastName;
  }

  public set lastName(lastName: string) {
    throwIfReadOnly('lastName', this._readOnly);
    this._lastName = lastName;
    this.validateDomainState();
  }

  public get avatar(): string {
    return this._avatar;
  }

  public set avatar(avatar: string) {
    throwIfReadOnly('avatar', this._readOnly);
    canNotBeEmpty('avatar', avatar);
    this._avatar = avatar;
    this.validateDomainState();
  }

  public createPhone(payload: RequestCreatePhone): boolean {
    throwIfReadOnly('phone', this._readOnly);
    this._phones.push(new PhoneValueObject(payload));
    this.validateDomainState();
    return true;
  }

  public updatePhone(payload: RequestUpdatePhone): boolean {
    throwIfReadOnly('phone', this._readOnly);
    for (let i = 0; i < this._phones.length; i += 1) {
      if (this._phones[i].id === payload.id) {
        this._phones[i] = new PhoneValueObject({ ...this._phones[i], ...payload });
        this.validateDomainState();
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
        this.validateDomainState();
        return true;
      }
    }
    return false;
  }

  public createDocument(payload: RequestCreateDocument): boolean {
    throwIfReadOnly('document', this._readOnly);
    this._documents.push(new DocumentValueObject(payload));
    this.validateDomainState();
    return true;
  }

  public updateDocument(payload: RequestUpdateDocument): boolean {
    throwIfReadOnly('document', this._readOnly);
    for (let i = 0; i < this._documents.length; i += 1) {
      if (this._documents[i].id === payload.id) {
        this._documents[i] = new DocumentValueObject({ ...this._documents[i], ...payload });
        this.validateDomainState();
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
        this.validateDomainState();
        return true;
      }
    }
    return false;
  }

  public createEmail(payload: RequestCreateEmail): boolean {
    throwIfReadOnly('email', this._readOnly);
    this._emails.push(new EmailValueObject(payload));
    this.validateDomainState();
    return true;
  }

  public updateEmail(payload: RequestUpdateEmail): boolean {
    throwIfReadOnly('email', this._readOnly);
    for (let i = 0; i < this._emails.length; i += 1) {
      if (this._emails[i].id === payload.id) {
        this._emails[i] = new EmailValueObject({ ...this._emails[i], ...payload });
        this.validateDomainState();
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
        this.validateDomainState();
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
    this.validateDomainState();
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
    this.validateDomainState();
  }

  public get salt(): string {
    return this._salt;
  }

  public set salt(salt: string) {
    throwIfReadOnly('salt', this._readOnly);
    if (salt === '') return;
    this._salt = salt;
    this.validateDomainState();
  }

  public get organization(): string {
    return this._organization;
  }

  public set organization(organization: string) {
    throwIfReadOnly('organization', this._readOnly);
    this._organization = organization || '';
    this.validateDomainState();
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

  private ensureTenancyRules(): void {
    if (shouldRequireOrganization(this.roles) && !this.organization) {
      throw new DomainValidationError('organization is required for admin and user roles');
    }
  }
}
