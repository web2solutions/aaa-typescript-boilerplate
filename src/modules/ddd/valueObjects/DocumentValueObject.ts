import { EDocumentType } from '@src/modules/ddd/valueObjects/EDocumentType';
import { UUID } from '@src/modules/port';
import { canNotBeEmpty } from '@src/shared/validators';

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
