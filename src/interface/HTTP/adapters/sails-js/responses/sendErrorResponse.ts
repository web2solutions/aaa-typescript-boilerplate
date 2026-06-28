import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { buildErrorResponsePayload, toHttpStatus } from '@src/shared/utils';
import { SailsJsResponse } from '@src/interface/HTTP/adapters/sails-js/SailsJsServer';

export function sendErrorResponse(error: BaseError, res: SailsJsResponse) {
  return res
    .status(toHttpStatus(error.code as EErrorStringCodes) || 500)
    .json(buildErrorResponsePayload(error));
}
