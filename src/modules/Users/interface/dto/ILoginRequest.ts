import { EAuthSchemaType } from '@src/modules/Users/service/ports/EAuthSchemaType';

export interface ILoginRequest {
  username: string;
  password: string;
  schemaType?: EAuthSchemaType;
}
