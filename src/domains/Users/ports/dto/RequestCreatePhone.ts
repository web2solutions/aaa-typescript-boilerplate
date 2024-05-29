export interface RequestCreatePhone {
  countryCode: number;
  localCode: number;
  number: string;
  isPrimary?: boolean;
}
