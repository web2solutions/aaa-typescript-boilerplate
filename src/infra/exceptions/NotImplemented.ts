import { BaseError } from '@src/infra/exceptions/BaseError';
import { EErrorStringCodes } from '@src/infra/exceptions/error.codes';
import { _INFRA_NOT_IMPLEMENTED_ } from '@src/config/constants';

export class NotImplemented extends BaseError {
  readonly code = EErrorStringCodes.NOT_IMPLEMENTED;

  readonly name = _INFRA_NOT_IMPLEMENTED_;
}
