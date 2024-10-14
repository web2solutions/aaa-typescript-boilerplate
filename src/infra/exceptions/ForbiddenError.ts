import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';
import { _FORBIDDEN_ERROR_NAME_ } from '@src/config/constants';

export class ForbiddenError extends BaseError {
  readonly code = EErrorStringCodes.FORBIDDEN;

  readonly name = _FORBIDDEN_ERROR_NAME_;
}
