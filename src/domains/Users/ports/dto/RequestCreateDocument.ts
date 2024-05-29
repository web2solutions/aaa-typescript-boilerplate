import { EDocumentType } from '@src/domains/valueObjects';

export interface RequestCreateDocument {
  data: string;
  type: EDocumentType;
  countryIssue: string;
}
