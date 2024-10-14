import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';

import { _LOCKED_RESOURCE_ERROR_NAME_ } from '@src/config/constants';

export class ResourceLockedError extends BaseError {
  readonly code = EErrorStringCodes.RESOURCE_LOCKED;

  readonly name = _LOCKED_RESOURCE_ERROR_NAME_;
}
