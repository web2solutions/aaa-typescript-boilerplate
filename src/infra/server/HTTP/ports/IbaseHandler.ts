import { IHTTPRequest } from './IHTTPRequest';
import { IHTTPResponse } from './IHTTPResponse';

export interface IbaseHandler {
    method: string;
    path: string;
    handler(req: IHTTPRequest, res: IHTTPResponse): void;
    securitySchemes?(req: IHTTPRequest, res: IHTTPResponse, next: typeof Function): void;
}
