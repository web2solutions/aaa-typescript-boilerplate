import { IServiceResponse } from '@src/infra/service/port/IServiceResponse';

export class ServiceResponse {
  public result: any = undefined;

  public error: Error | undefined = undefined;

  public message: string | undefined = undefined;

  constructor(data: IServiceResponse) {
    const { result, error, message } = data;
    if (result) this.result = result;
    if (error) this.error = error;
    if (message) this.message = message;
  }
}
