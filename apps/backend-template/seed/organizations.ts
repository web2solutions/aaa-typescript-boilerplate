import { UUID } from '@src/modules/port';
import {
  AddressValueObject,
  EAddressType,
  EEmailType,
  EmailValueObject,
  PhoneValueObject
} from '@src/modules/ddd/valueObjects';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';

const now = new Date();

const organizations: IOrganization[] = [
  {
    id: UUID.create().toString(),
    createdAt: now,
    updatedAt: now,
    name: 'ACME',
    address: [{
      email: 'hq@acme.dev',
      type: EAddressType.work,
      isPrimary: true
    } as AddressValueObject],
    email: [{
      email: 'contact@acme.dev',
      type: EEmailType.work,
      isPrimary: true
    } as EmailValueObject],
    phone: [{
      number: '99805-4033',
      localCode: '27',
      countryCode: '+55',
      isPrimary: true
    } as PhoneValueObject],
    users: []
  },
  {
    id: UUID.create().toString(),
    createdAt: now,
    updatedAt: now,
    name: 'Umbrella',
    address: [{
      email: 'ops@umbrella.dev',
      type: EAddressType.work,
      isPrimary: true
    } as AddressValueObject],
    email: [{
      email: 'support@umbrella.dev',
      type: EEmailType.work,
      isPrimary: true
    } as EmailValueObject],
    phone: [{
      number: '98883-2732',
      localCode: '27',
      countryCode: '+55',
      isPrimary: true
    } as PhoneValueObject],
    users: []
  }
];

export default organizations;
