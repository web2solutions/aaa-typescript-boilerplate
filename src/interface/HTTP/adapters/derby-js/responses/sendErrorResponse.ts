import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { buildErrorResponsePayload, toHttpStatus } from '@src/shared/utils';
import { DerbyJsResponse } from '@src/interface/HTTP/adapters/derby-js/DerbyJsServer';

export function sendErrorResponse(error: BaseError, res: DerbyJsResponse) {
  return res
    .status(toHttpStatus(error.code as EErrorStringCodes) || 500)
    .json(buildErrorResponsePayload(error));
}
