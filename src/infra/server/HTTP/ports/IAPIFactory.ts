import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IHTTPServer } from '@src/infra/server/HTTP/ports/IHTTPServer';
// import { IMutexService } from '@src/domains/ports/mutex/IMutexService';
import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { IAuthService } from '@src/infra/auth/IAuthService';
import { IPasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { IKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/IKeyValueStorageClient';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';

export interface IAPIFactory<ServerType> {
  databaseClient: IDatabaseClient,
  webServer: IHTTPServer<ServerType>,
  serverType?: EHTTPFrameworks;
  mutexService?: IMutexService,
  infraHandlers: Record<string, EndPointFactory>;
  authService?: IAuthService;
  passwordCryptoService?: IPasswordCryptoService;
  keyValueStorageClient?: IKeyValueStorageClient;
}
