import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { formatErrorMessage, toHttpStatus } from '@src/infra/utils';

export function sendErrorResponse(error: BaseError) {
  return {
    statusCode: toHttpStatus(error.code as EErrorStringCodes) || 500,
    body: JSON.stringify({
      message: formatErrorMessage(error),
      error
    })
  };
}
