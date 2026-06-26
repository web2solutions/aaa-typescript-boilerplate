// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
import { IUser } from '@src/modules/Users';
import { UUID } from '@src/modules/port';
import {
  DocumentValueObject,
  EDocumentType,
  EEmailType,
  EmailValueObject,
  PhoneValueObject
} from '@src/modules/ddd/valueObjects';
import organizations from '@seed/organizations';

const buildSeedCredential = (account: string): string => `seed-${account}-A1!`;

const users: Array<IUser> = [{
  id: UUID.create().toString(),
  firstName: 'Abraham',
  lastName: 'Lincoln',
  emails: [
    {
      email: 'eduardo@xpertminds.dev',
      type: EEmailType.work,
      isPrimary: true
    } as EmailValueObject,
    {
      email: 'web2solucoes@gmail.com',
      type: EEmailType.work,
      isPrimary: false
    } as EmailValueObject,
    {
      email: 'perottas1@hotmail.com',
      type: EEmailType.work,
      isPrimary: false
    } as EmailValueObject
  ],
  avatar: 'avatar.png',
  username: 'eduardo@xpertminds.dev',
  password: buildSeedCredential('user1'),
  organization: organizations[0].id,
  roles: [
    'access_allow',
    'create_account',
    'read_account',
    'update_account',
    'delete_account',
    'create_transaction',
    'delete_transaction',
    'read_transaction',
    'create_user',
    'read_user',
    'update_user',
    'delete_user'
  ],
  documents: [
    {
      data: '000-000-000',
      type: EDocumentType.SSN,
      countryIssue: 'US'
    } as DocumentValueObject,
    {
      data: '000.000.000-00',
      type: EDocumentType.CPF,
      countryIssue: 'BR'
    } as DocumentValueObject,
    {
      data: '0000000000000',
      type: EDocumentType.PASSPORT,
      countryIssue: 'BR'
    } as DocumentValueObject
  ],
  phones: [
    {
      number: '99805-4033',
      localCode: '27',
      countryCode: '+55',
      isPrimary: true
    } as PhoneValueObject,
    {
      number: '98883-2732',
      localCode: '27',
      countryCode: '+55',
      isPrimary: true
    } as PhoneValueObject,
    {
      number: '99737-5850',
      localCode: '27',
      countryCode: '+55',
      isPrimary: true
    } as PhoneValueObject
  ]
},
{
  id: UUID.create().toString(),
  firstName: 'Barack',
  lastName: 'Obama',
  emails: [{
    email: 'user2@xpertminds.dev',
    type: EEmailType.work,
    isPrimary: true
  } as EmailValueObject],
  avatar: 'avatar.png',
  username: 'user2',
  password: buildSeedCredential('user2'),
  organization: organizations[0].id,
  roles: [
    'access_allow',
    'create_transaction',
    'read_account',
    'read_transaction',
    // 'create_user',
    'read_user'
    // 'update_user',
    // 'delete_user'
  ]
},
{
  id: UUID.create().toString(),
  firstName: 'Jimmy',
  lastName: 'Carter',
  emails: [{
    email: 'user3@xpertminds.dev',
    type: EEmailType.work,
    isPrimary: true
  } as EmailValueObject],
  avatar: 'avatar.png',
  username: 'user3@xpertminds.dev',
  password: buildSeedCredential('user3'),
  organization: organizations[1].id,
  roles: [
    'access_allow',
    'read_account',
    'read_transaction',
    // 'create_user',
    'read_user'
    // 'update_user',
    // 'delete_user'
  ]
},
{
  id: UUID.create().toString(),
  firstName: 'James',
  lastName: 'Bush',
  emails: [{
    email: 'user4@xpertminds.dev',
    type: EEmailType.work,
    isPrimary: true
  } as EmailValueObject],
  avatar: 'avatar.png',
  username: 'user4@xpertminds.dev',
  password: buildSeedCredential('user4'),
  organization: organizations[1].id,
  roles: [
    'access_allow',
    'create_transaction'
  ]
}
];
export default users;
