import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';
import { _DOMAIN_NOT_FOUND_ERROR_NAME_ } from '@src/config/constants';

export class DomainNotFoundError extends BaseError {
  readonly code = EErrorStringCodes.NOT_FOUND;

  readonly name = _DOMAIN_NOT_FOUND_ERROR_NAME_;
}
