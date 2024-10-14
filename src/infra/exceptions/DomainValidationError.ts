import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';
import { _DOMAIN_VALIDATION_ERROR_NAME_ } from '@src/config/constants';

export class DomainValidationError extends BaseError {
  readonly code = EErrorStringCodes.INVALID_INPUT;

  readonly name = _DOMAIN_VALIDATION_ERROR_NAME_;
}
