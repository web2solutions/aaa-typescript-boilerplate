import { IUser } from '@src/domains/Users';
import { UUID } from '@src/domains/utils';
import { DocumentValueObject, EDocumentType, EEmailType, EmailValueObject, PhoneValueObject } from '@src/domains/valueObjects';

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
      isPrimary: true
    } as EmailValueObject,
    {
      email: 'perottas1@hotmail.com',
      type: EEmailType.work,
      isPrimary: true
    } as EmailValueObject
  ],
  avatar: 'avatar.png',
  login: {
    username: 'user1',
    password: 'user1_password'
  },
  roles: [
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
  ],
},
{
  id: UUID.create().toString(),
  firstName: 'Barack',
  lastName: 'Obama',
  emails: [],
  avatar: 'avatar.png',
  login: {
    username: 'user2',
    password: 'user2_password'
  },
  roles: [
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
  emails: [],
  avatar: 'avatar.png',
  login: {
    username: 'user3',
    password: 'user3_password'
  },
  roles: [
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
  emails: [],
  avatar: 'avatar.png',
  login: {
    username: 'user4',
    password: 'user4_password'
  },
  roles: [
    'create_transaction'
  ]
}
];
export default users;
