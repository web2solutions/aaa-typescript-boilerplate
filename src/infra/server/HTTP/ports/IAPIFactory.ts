import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IHTTPServer } from '@src/infra/server/HTTP/ports/IHTTPServer';
import { IMutexClient } from '@src/domains/ports/mutex/IMutexClient';
import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { IAuthService } from '@src/infra/auth/IAuthService';
import { IPasswordCryptoService } from '@src/infra/security/PasswordCryptoService';

export interface IAPIFactory<ServerType> {
  databaseClient: IDatabaseClient,
  webServer: IHTTPServer<ServerType>,
  serverType?: EHTTPFrameworks;
  mutexService?: IMutexClient,
  infraHandlers: Record<string, EndPointFactory>;
  authService?: IAuthService;
  passwordCryptoService?: IPasswordCryptoService;
}
