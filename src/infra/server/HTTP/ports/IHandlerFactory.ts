import { OpenAPIV3 } from 'openapi-types';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IMutexClient } from '@src/infra/mutex/port/IMutexClient';
import { IAuthService } from '@src/infra/auth/IAuthService';
import { IController } from './IController';

export interface IHandlerFactory {
    databaseClient: IDatabaseClient;
    mutexClient?: IMutexClient;
    endPointConfig: Record<string, any>;
    spec: OpenAPIV3.Document;
    version?: string;
    apiDocs?: Map<string, OpenAPIV3.Document>;
    authService?: IAuthService;
    controller?: IController;
}
