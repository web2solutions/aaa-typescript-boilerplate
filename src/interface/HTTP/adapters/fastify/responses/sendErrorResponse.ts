// file deepcode ignore ServerLeak: <error information is available only for authorized users>
import { FastifyReply } from 'fastify';
import { buildErrorResponsePayload, toHttpStatus } from '@src/shared/utils';
import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';

export function sendErrorResponse(error: BaseError, res: FastifyReply) {
  res
    .code(toHttpStatus(error.code as EErrorStringCodes) || 500)
    .send(buildErrorResponsePayload(error));
}
