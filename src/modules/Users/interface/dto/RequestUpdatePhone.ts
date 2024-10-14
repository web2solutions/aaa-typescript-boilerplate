export interface RequestUpdatePhone {
  id: string;
  countryCode?: string;
  localCode?: string;
  number?: string;
  isPrimary?: boolean;
}
