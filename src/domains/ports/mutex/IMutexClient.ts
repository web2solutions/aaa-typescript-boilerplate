import { IServiceResponse } from '@src/infra/service/port/IServiceResponse';

export interface IMutexClient {
    connect(): Promise<IServiceResponse>;
    disconnect(): Promise<IServiceResponse>;
    lock(resourceName: string, uuid: string): Promise<IServiceResponse>;
    isLocked(resourceName: string, uuid: string): Promise<IServiceResponse>;
    unlock(resourceName: string, uuid: string): Promise<IServiceResponse>;
}
