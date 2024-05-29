export interface RequestUpdatePhone {
  id: string;
  countryCode?: number;
  localCode?: number;
  number?: string;
  isPrimary?: boolean;
}
