import { IDbClient } from '@src/infra/persistence/port/IDbClient';
import { IHTTPServer } from '@src/infra/server/HTTP/ports/IHTTPServer';
import { IMutexClient } from '@src/domains/ports/mutex/IMutexClient';
import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';

export interface IAPIFactory<ServerType> {
  dbClient: IDbClient,
  webServer: IHTTPServer<ServerType>,
  serverType?: EHTTPFrameworks;
  mutexService?: IMutexClient,
  infraHandlers: Record<string, EndPointFactory>
}
