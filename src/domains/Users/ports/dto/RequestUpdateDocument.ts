import { EDocumentType } from '@src/domains/valueObjects';

export interface RequestUpdateDocument {
  id: string;
  data?: string;
  type?: EDocumentType;
  countryIssue?: string;
}
