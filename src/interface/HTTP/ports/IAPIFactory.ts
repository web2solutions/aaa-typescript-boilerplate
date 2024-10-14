import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IHTTPServer, EndPointFactory, EHTTPFrameworks } from '@src/interface/HTTP/ports';
// import { IMutexService } from '@src/domains/ports/mutex/IMutexService';
import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
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
