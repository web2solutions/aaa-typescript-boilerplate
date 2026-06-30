/* eslint-disable no-underscore-dangle */
import { BaseModel, hasMany, HasMany } from '@src/modules/port';
import { canNotBeEmpty, throwIfReadOnly } from '@src/shared/validators';
import {
  AddressValueObject,
  EmailValueObject,
  PhoneValueObject
} from '@src/modules/ddd/valueObjects';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { User } from '@src/modules/Users/domain/Model/User';

interface OrganizationFactory extends RequestCreateOrganization {
  id?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  readOnly?: boolean;
}

interface RequestUpdateAddress {
  id: string;
  email?: string;
  type?: string;
  isPrimary?: boolean;
}

type OrganizationPhonePayload = NonNullable<RequestCreateOrganization['phone']>[number];
type OrganizationEmailPayload = NonNullable<RequestCreateOrganization['email']>[number];

export class Organization extends BaseModel<IOrganization> implements IOrganization {
  public static readonly dataEntitySchema = {
    name: 'Organization',
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
        name: 'name',
        type: 'string',
        required: true,
        validations: ['minLength:1']
      },
      {
        name: 'address',
        type: 'array',
        required: false,
        validations: []
      },
      {
        name: 'phone',
        type: 'array',
        required: false,
        validations: []
      },
      {
        name: 'email',
        type: 'array',
        required: false,
        validations: []
      },
      {
        name: 'users',
        type: 'array',
        required: false,
        validations: []
      }
    ]
  } as const;

  private _name: string = '';

  private _address: AddressValueObject[] = [];

  private _phone: PhoneValueObject[] = [];

  private _email: EmailValueObject[] = [];

  private _users: string[] = [];

  @hasMany(() => User)
  public userEntities: HasMany<typeof User> = [];

  private readonly _readOnly: boolean = false;

  private _skipDomainValidation: boolean = true;

  constructor(payload: OrganizationFactory) {
    super({
      id: payload.id,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt
    });
    BaseModel.throwIfDataEntitySchemaIsNotOpenApi31Compliant(Organization.dataEntitySchema as any);
    this.name = payload.name;
    payload.address?.forEach((entry) => this.createAddress(entry));
    payload.phone?.forEach((entry) => this.createPhone(entry));
    payload.email?.forEach((entry) => this.createEmail(entry));
    this._users = [...(payload.users || [])];
    this._readOnly = payload.readOnly ?? false;
    this._excludeOnSerialize = [
      'createAddress',
      'updateAddress',
      'deleteAddress',
      'createPhone',
      'updatePhone',
      'deletePhone',
      'createEmail',
      'updateEmail',
      'deleteEmail'
    ];
    this._skipDomainValidation = false;
    this.validateDomainState();
  }

  private validateDomainState(): void {
    if (this._skipDomainValidation) return;
    BaseModel.throwIfModelPayloadIsNotOpenApi31Compliant(
      {
        id: this.id,
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString(),
        name: this.name,
        address: this.address.map((entry) => ({ ...entry })),
        phone: this.phone.map((entry) => ({ ...entry })),
        email: this.email.map((entry) => ({ ...entry })),
        users: [...this.users]
      },
      Organization.dataEntitySchema as any
    );
  }

  public get name(): string {
    return this._name;
  }

  public set name(name: string) {
    throwIfReadOnly('name', this._readOnly);
    canNotBeEmpty('name', name);
    this._name = name;
    this.validateDomainState();
  }

  public get address(): AddressValueObject[] {
    return [...this._address];
  }

  public createAddress(payload: Record<string, any>): boolean {
    throwIfReadOnly('address', this._readOnly);
    this._address.push(new AddressValueObject(payload));
    this.validateDomainState();
    return true;
  }

  public updateAddress(payload: RequestUpdateAddress): boolean {
    throwIfReadOnly('address', this._readOnly);
    for (let i = 0; i < this._address.length; i += 1) {
      if (this._address[i].id === payload.id) {
        this._address[i] = new AddressValueObject({ ...this._address[i], ...payload });
        this.validateDomainState();
        return true;
      }
    }
    return false;
  }

  public deleteAddress(id: string): boolean {
    throwIfReadOnly('address', this._readOnly);
    for (let i = 0; i < this._address.length; i += 1) {
      if (this._address[i].id === id) {
        this._address.splice(i, 1);
        this.validateDomainState();
        return true;
      }
    }
    return false;
  }

  public get phone(): PhoneValueObject[] {
    return [...this._phone];
  }

  public createPhone(payload: OrganizationPhonePayload): boolean {
    throwIfReadOnly('phone', this._readOnly);
    this._phone.push(new PhoneValueObject(payload));
    this.validateDomainState();
    return true;
  }

  public updatePhone(payload: Partial<OrganizationPhonePayload> & { id: string }): boolean {
    throwIfReadOnly('phone', this._readOnly);
    for (let i = 0; i < this._phone.length; i += 1) {
      if (this._phone[i].id === payload.id) {
        this._phone[i] = new PhoneValueObject({ ...this._phone[i], ...payload });
        this.validateDomainState();
        return true;
      }
    }
    return false;
  }

  public deletePhone(id: string): boolean {
    throwIfReadOnly('phone', this._readOnly);
    for (let i = 0; i < this._phone.length; i += 1) {
      if (this._phone[i].id === id) {
        this._phone.splice(i, 1);
        this.validateDomainState();
        return true;
      }
    }
    return false;
  }

  public get email(): EmailValueObject[] {
    return [...this._email];
  }

  public createEmail(payload: OrganizationEmailPayload): boolean {
    throwIfReadOnly('email', this._readOnly);
    this._email.push(new EmailValueObject(payload));
    this.validateDomainState();
    return true;
  }

  public updateEmail(payload: Partial<OrganizationEmailPayload> & { id: string }): boolean {
    throwIfReadOnly('email', this._readOnly);
    for (let i = 0; i < this._email.length; i += 1) {
      if (this._email[i].id === payload.id) {
        this._email[i] = new EmailValueObject({ ...this._email[i], ...payload });
        this.validateDomainState();
        return true;
      }
    }
    return false;
  }

  public deleteEmail(id: string): boolean {
    throwIfReadOnly('email', this._readOnly);
    for (let i = 0; i < this._email.length; i += 1) {
      if (this._email[i].id === id) {
        this._email.splice(i, 1);
        this.validateDomainState();
        return true;
      }
    }
    return false;
  }

  public get users(): string[] {
    return [...this._users];
  }
}
