// import { UUID } from '@src/domains/utils';
import { EEmailType, EmailValueObject } from '@src/domains/valueObjects';

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
