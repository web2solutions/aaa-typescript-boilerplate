import { IHTTPRequest } from './IHTTPRequest';
import { IHTTPResponse } from './IHTTPResponse';

export interface IbaseHandler {
    method: string;
    path: string;
    handler(req: IHTTPRequest, res: IHTTPResponse, next?: any): void | Promise<any>;
    securitySchemes?(req: IHTTPRequest, res: IHTTPResponse, next: any): void;
}
