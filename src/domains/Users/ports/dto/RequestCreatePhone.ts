export interface RequestCreatePhone {
  countryCode: string;
  localCode: string;
  number: string;
  isPrimary?: boolean;
}
