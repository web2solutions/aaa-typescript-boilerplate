import { IHTTPRequest } from './IHTTPRequest';
import { IHTTPResponse } from './IHTTPResponse';

export interface IbaseHandlerFactory {
    method: string;
    path: string;
    handler(req: IHTTPRequest, res: IHTTPResponse): void;
}
