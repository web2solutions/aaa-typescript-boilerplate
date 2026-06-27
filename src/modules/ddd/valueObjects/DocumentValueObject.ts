import { EDocumentType } from '@src/modules/ddd/valueObjects/EDocumentType';
import { UUID } from '@src/modules/port';
import { canNotBeEmpty, throwIfIsNotObject } from '@src/shared/validators';
import { DomainValidationError } from '@src/infra/exceptions';

export interface IDocumentValueObjectPayload {
  id?: string;
  type: EDocumentType | string;
  countryIssue: string;
  data: string;
}

export class DocumentValueObject {
  public readonly id: string;

  public readonly type: EDocumentType;

  public readonly countryIssue: string;

  public readonly data: string;

  public constructor(payload: IDocumentValueObjectPayload) {
    throwIfIsNotObject('payload', payload);
    const {
      id,
      type,
      countryIssue,
      data
    } = payload;
    canNotBeEmpty('type', type);
    canNotBeEmpty('countryIssue', countryIssue);
    canNotBeEmpty('data', data);

    const normalizedType = DocumentValueObject.normalizeType(type);
    const normalizedCountryIssue = DocumentValueObject.normalizeCountryIssue(countryIssue);
    const normalizedData = DocumentValueObject.normalizeData(data);

    this.id = id ? UUID.parse(id).toString() : UUID.create().toString();
    this.type = normalizedType;
    this.data = normalizedData;
    this.countryIssue = normalizedCountryIssue;
  }

  private static normalizeType(input: EDocumentType | string): EDocumentType {
    const value = `${input}`.trim();
    if (!value) {
      throw new DomainValidationError('type can not be empty');
    }

    const enumValues = Object.values(EDocumentType);
    const directMatch = enumValues.find((item) => item === value);
    if (directMatch) {
      return directMatch as EDocumentType;
    }

    if (value.toUpperCase() === 'PASSPORT') {
      return EDocumentType.PASSPORT;
    }

    throw new DomainValidationError(`Invalid document type: ${value}`);
  }

  private static normalizeCountryIssue(input: string): string {
    const value = `${input}`.trim().toUpperCase();
    if (!value) {
      throw new DomainValidationError('countryIssue can not be empty');
    }
    return value;
  }

  private static normalizeData(input: string): string {
    const value = `${input}`.trim();
    if (!value) {
      throw new DomainValidationError('data can not be empty');
    }
    return value;
  }
}
