import { IServiceResponse } from '@src/modules/port/IServiceResponse';

export interface IMutexService {
    lock(resourceName: string, uuid: string): Promise<IServiceResponse>;
    isLocked(resourceName: string, uuid: string): Promise<IServiceResponse>;
    unlock(resourceName: string, uuid: string): Promise<IServiceResponse>;
}
