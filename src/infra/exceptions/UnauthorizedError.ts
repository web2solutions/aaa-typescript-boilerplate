import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';
import { _UNAUTHORIZED_ERROR_NAME_ } from '@src/config/constants';

export class UnauthorizedError extends BaseError {
  readonly code = EErrorStringCodes.UNAUTHORIZED;

  readonly name = _UNAUTHORIZED_ERROR_NAME_;
}
