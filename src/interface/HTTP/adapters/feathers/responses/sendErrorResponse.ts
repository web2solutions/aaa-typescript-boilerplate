import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { buildErrorResponsePayload, toHttpStatus } from '@src/shared/utils';
import { FeathersResponse } from '@src/interface/HTTP/adapters/feathers/FeathersServer';

export function sendErrorResponse(error: BaseError, res: FeathersResponse) {
  return res
    .status(toHttpStatus(error.code as EErrorStringCodes) || 500)
    .json(buildErrorResponsePayload(error));
}
