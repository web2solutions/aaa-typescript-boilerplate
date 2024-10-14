import { EDocumentType } from '@src/modules/ddd/valueObjects';

export interface RequestUpdateDocument {
  id: string;
  data?: string;
  type?: EDocumentType;
  countryIssue?: string;
}
