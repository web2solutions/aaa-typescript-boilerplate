type IError = Error | undefined;
export interface IServiceResponse {
    result?: any;
    error?: IError
    message?: string | undefined;
}
