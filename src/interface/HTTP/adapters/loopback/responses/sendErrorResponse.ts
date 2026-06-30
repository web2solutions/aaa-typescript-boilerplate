import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { buildErrorResponsePayload, toHttpStatus } from '@src/shared/utils';
import { LoopBackResponse } from '@src/interface/HTTP/adapters/loopback/LoopBackServer';

export function sendErrorResponse(error: BaseError, res: LoopBackResponse) {
  return res
    .status(toHttpStatus(error.code as EErrorStringCodes) || 500)
    .json(buildErrorResponsePayload(error));
}
