import { UUID } from '../utils';
import { canNotBeEmpty, mustBeNumeric, mustBePositiveNumber } from '../validators';

export class PhoneValueObject {
  public id: string;

  public countryCode: number;

  public localCode: number;

  public number: string;

  public isPrimary: boolean;

  constructor(payload: any) {
    const {
      id,
      countryCode,
      localCode,
      number,
      isPrimary
    } = payload;
    canNotBeEmpty('number', number);
    mustBeNumeric('countryCode', countryCode);
    mustBePositiveNumber('countryCode', countryCode);
    mustBeNumeric('localCode', localCode);
    mustBePositiveNumber('localCode', localCode);
    this.id = id ? UUID.parse(id).toString() : UUID.create().toString();
    this.number = number;
    this.localCode = localCode;
    this.countryCode = countryCode;
    this.isPrimary = !!isPrimary ?? false;
  }
}
