import { Response } from 'express';

import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { formatErrorMessage, toHttpStatus } from '@src/shared/utils';

export function sendErrorResponse(error: BaseError, res: Response) {
  res.status(toHttpStatus(error.code as EErrorStringCodes) || 500).json({
    message: formatErrorMessage(error),
    error
  });
}
