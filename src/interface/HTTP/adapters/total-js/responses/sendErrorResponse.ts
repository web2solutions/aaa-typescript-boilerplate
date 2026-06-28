import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { buildErrorResponsePayload, toHttpStatus } from '@src/shared/utils';
import { TotalJsResponse } from '@src/interface/HTTP/adapters/total-js/TotalJsServer';

export function sendErrorResponse(error: BaseError, res: TotalJsResponse) {
  return res
    .status(toHttpStatus(error.code as EErrorStringCodes) || 500)
    .json(buildErrorResponsePayload(error));
}
