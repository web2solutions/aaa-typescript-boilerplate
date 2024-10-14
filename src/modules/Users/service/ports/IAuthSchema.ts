import { EAuthSchemaType } from './EAuthSchemaType';

export interface IAuthSchema {
  type: EAuthSchemaType
  token: string;
}
