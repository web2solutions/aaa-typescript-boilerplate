import { Response } from 'restify';
import { formatErrorMessage, toHttpStatus } from '@src/shared/utils';
import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';

export function sendErrorResponse(error: BaseError, res: Response) {
  res.status(toHttpStatus(error.code as EErrorStringCodes) || 500);
  res.json({
    message: formatErrorMessage(error),
    error
  });
}
