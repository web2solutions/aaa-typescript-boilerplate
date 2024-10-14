import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';
import { _INTERNAL_SERVER_ERROR_ } from '@src/config/constants';

export class InternalServerError extends BaseError {
  readonly code = EErrorStringCodes.INTERNAL_SERVER_ERROR;

  readonly name = _INTERNAL_SERVER_ERROR_;
}
