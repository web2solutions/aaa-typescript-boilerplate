import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';
import { _EVENT_INVALID_MESSAGE_ } from '@src/config/constants';

export class ComposeEventError extends BaseError {
  readonly code = EErrorStringCodes.INVALID_INPUT;

  readonly name = _EVENT_INVALID_MESSAGE_;
}
