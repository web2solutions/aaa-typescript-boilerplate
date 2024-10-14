// file deepcode ignore ServerLeak: <error information is available only for authorized users>
import { FastifyReply } from 'fastify';
import { formatErrorMessage, toHttpStatus } from '@src/infra/utils';
import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';

export function sendErrorResponse(error: BaseError, res: FastifyReply) {
  res.code(toHttpStatus(error.code as EErrorStringCodes) || 500).send({
    message: formatErrorMessage(error),
    error
  });
}
