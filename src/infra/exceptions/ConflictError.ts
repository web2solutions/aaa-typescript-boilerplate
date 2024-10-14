import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';
import { _DATABASE_CONFLICT_ERROR_NAME_ } from '@src/config/constants';

export class ConflictError extends BaseError {
  readonly code = EErrorStringCodes.CONFLICT;

  readonly name = _DATABASE_CONFLICT_ERROR_NAME_;
}
