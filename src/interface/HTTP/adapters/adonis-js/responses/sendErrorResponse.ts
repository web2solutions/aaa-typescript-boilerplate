import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { buildErrorResponsePayload, toHttpStatus } from '@src/shared/utils';
import { AdonisJsResponse } from '@src/interface/HTTP/adapters/adonis-js/AdonisJsServer';

export function sendErrorResponse(error: BaseError, res: AdonisJsResponse) {
  return res
    .status(toHttpStatus(error.code as EErrorStringCodes) || 500)
    .json(buildErrorResponsePayload(error));
}
