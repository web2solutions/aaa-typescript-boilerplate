import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';
import { _DATABASE_PAGING_ERROR_ } from '@src/config/constants';

export class DatabasePagingError extends BaseError {
  readonly code = EErrorStringCodes.INVALID_INPUT;

  readonly name = _DATABASE_PAGING_ERROR_;
}
