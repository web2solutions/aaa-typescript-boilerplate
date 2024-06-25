import { OpenAPIV3 } from 'openapi-types';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IAuthService } from '@src/infra/auth/IAuthService';
import { IController } from './IController';

export interface IHandlerFactory {
    databaseClient: IDatabaseClient;
    mutexService?: IMutexService;
    endPointConfig: Record<string, any>;
    spec: OpenAPIV3.Document;
    version?: string;
    apiDocs?: Map<string, OpenAPIV3.Document>;
    authService?: IAuthService;
    controller?: IController;
}
