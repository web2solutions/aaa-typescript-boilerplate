import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { buildErrorResponsePayload, toHttpStatus } from '@src/shared/utils';

export function sendErrorResponse(error: BaseError) {
  return {
    statusCode: toHttpStatus(error.code as EErrorStringCodes) || 500,
    body: JSON.stringify(buildErrorResponsePayload(error))
  };
}
