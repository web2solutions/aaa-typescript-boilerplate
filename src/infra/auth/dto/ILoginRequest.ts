import { EAuthSchemaType } from '../EAuthSchemaType';

export interface ILoginRequest {
  username: string;
  password: string;
  schemaType?: EAuthSchemaType;
}
