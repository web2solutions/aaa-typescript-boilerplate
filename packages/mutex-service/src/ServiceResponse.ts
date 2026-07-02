import { IServiceResponse } from './contracts';

export class ServiceResponse {
  public result: unknown = undefined;

  public error: Error | Record<string, any> | undefined = undefined;

  public message: string | undefined = undefined;

  constructor(data: IServiceResponse) {
    const { result, error, message } = data;
    if (result !== undefined) this.result = result;
    if (error) this.error = error;
    if (message) this.message = message;
  }
}
