import { OpenAPIV3 } from 'openapi-types';
import { IDbClient } from '@src/infra/persistence/port/IDbClient';
import { IMutexClient } from '@src/infra/mutex/port/IMutexClient';

export interface IHandlerFactory {
    dbClient: IDbClient;
    mutexClient?: IMutexClient;
    endPointConfig: Record<string, any>;
    spec: OpenAPIV3.Document;
    version?: string;
    apiDocs?: Map<string, OpenAPIV3.Document>;
}
