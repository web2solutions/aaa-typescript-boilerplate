import { EDocumentType } from './EDocumentType';
import { UUID } from '../utils';
import { canNotBeEmpty } from '../validators';

export class DocumentValueObject {
  public id: string;

  public type: EDocumentType;

  public countryIssue: string;

  public data: string;

  constructor(payload: any) {
    const {
      id,
      type,
      countryIssue,
      data
    } = payload;
    canNotBeEmpty('type', type);
    canNotBeEmpty('countryIssue', countryIssue);
    canNotBeEmpty('data', data);
    this.id = id ? UUID.parse(id).toString() : UUID.create().toString();
    this.type = type;
    this.data = data;
    this.countryIssue = countryIssue;
  }
}
