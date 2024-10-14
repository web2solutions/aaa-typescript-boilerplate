// import { UUID } from '@src/modules/port';
import { DocumentValueObject, EDocumentType } from '@src/modules/ddd/valueObjects';

const documents: Array<DocumentValueObject> = [
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
];
export default documents;
