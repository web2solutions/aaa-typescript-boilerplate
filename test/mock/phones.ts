// import { UUID } from '@src/modules/port';
import { PhoneValueObject } from '@src/modules/ddd/valueObjects';

const phones: Array<PhoneValueObject> = [
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
];
export default phones;
