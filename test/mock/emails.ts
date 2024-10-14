// import { UUID } from '@src/modules/port';
import { EEmailType, EmailValueObject } from '@src/modules/ddd/valueObjects';

const emails: Array<EmailValueObject> = [
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
];
export default emails;
