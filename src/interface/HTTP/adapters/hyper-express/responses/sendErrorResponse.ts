import HyperExpress from 'hyper-express';
import { formatErrorMessage, toHttpStatus } from '@src/infra/utils';
import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';

export function sendErrorResponse(error: BaseError, res: HyperExpress.Response) {
  res.status(toHttpStatus(error.code as EErrorStringCodes) || 500).json({
    message: formatErrorMessage(error),
    error
  });
}
