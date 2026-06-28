import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { buildErrorResponsePayload, toHttpStatus } from '@src/shared/utils';
import type { CloudflareWorkersResponse } from '@src/interface/HTTP/adapters/cloudflare-workers/cloudflare-workers';

export function sendErrorResponse(error: BaseError, res: CloudflareWorkersResponse) {
  return res
    .status(toHttpStatus(error.code as EErrorStringCodes) || 500)
    .json(buildErrorResponsePayload(error));
}
