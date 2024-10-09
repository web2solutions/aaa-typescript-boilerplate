import { EAuthSchemaType } from './EAuthSchemaType';

export interface IloginRequest {
  username: string;
  password: string;
  schemaType: EAuthSchemaType;
}
