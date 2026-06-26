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
  readOnly?: boolean;
}

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
    super(payload.id);
    BaseModel.throwIfDataEntitySchemaIsNotOpenApi31Compliant(Organization.dataEntitySchema as any);
    this.name = payload.name;
    this._address = (payload.address || []).map((entry) => new AddressValueObject(entry));
    this._phone = (payload.phone || []).map((entry) => new PhoneValueObject(entry));
    this._email = (payload.email || []).map((entry) => new EmailValueObject(entry));
    this._users = [...(payload.users || [])];
    this._readOnly = payload.readOnly ?? false;
    this._skipDomainValidation = false;
    this.validateDomainState();
  }

  private validateDomainState(): void {
    if (this._skipDomainValidation) return;
    BaseModel.throwIfModelPayloadIsNotOpenApi31Compliant(
      {
        id: this.id,
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

  public get phone(): PhoneValueObject[] {
    return [...this._phone];
  }

  public get email(): EmailValueObject[] {
    return [...this._email];
  }

  public get users(): string[] {
    return [...this._users];
  }
}
