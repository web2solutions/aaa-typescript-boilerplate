import {
  _VALIDATION_ERROR_NAME_,
  _DOMAIN_VALIDATION_ERROR_NAME_,
  _FORBIDDEN_ERROR_NAME_,
  _NOT_FOUND_ERROR_NAME_,
  _DOMAIN_NOT_FOUND_ERROR_NAME_,
  _DATABASE_NOT_FOUND_ERROR_NAME_,
  _DATABASE_CONFLICT_ERROR_NAME_,
  _EVENT_INVALID_MESSAGE_,
  _UNAUTHORIZED_ERROR_NAME_,
  // _INFRA_NOT_IMPLEMENTED_,
  _DATABASE_PAGING_ERROR_,
  _LOCKED_RESOURCE_ERROR_NAME_

} from '@src/config/constants';
import { BaseError, EErrorNumberCodes, EErrorStringCodes } from '@src/infra/exceptions';

export function replaceVars(path: string): string {
  return path.toString().replace(/{/g, ':').replace(/}/g, '');
}

export function toHttpStatus(stringCode: EErrorStringCodes): number {
  return EErrorNumberCodes[stringCode as any] as unknown as number;
}

export function formatErrorMessage(error: BaseError) {
  let message: string = '';
  if (
    error.name === _VALIDATION_ERROR_NAME_
    || error.name === _DOMAIN_VALIDATION_ERROR_NAME_
    || error.name === _EVENT_INVALID_MESSAGE_
    || error.name === _DATABASE_PAGING_ERROR_
  ) {
    message = `Bad Request - ${error.message}`;
  } else if (error.name === _FORBIDDEN_ERROR_NAME_) {
    message = `Forbidden - ${error.message}`;
  } else if (error.name === _UNAUTHORIZED_ERROR_NAME_) {
    message = `Unauthorized - ${error.message}`;
  } else if (error.name === _LOCKED_RESOURCE_ERROR_NAME_) {
    message = `Locked - ${error.message}`;
  } else if (
    error.name === _NOT_FOUND_ERROR_NAME_
    || error.name === _DOMAIN_NOT_FOUND_ERROR_NAME_
    || error.name === _DATABASE_NOT_FOUND_ERROR_NAME_
  ) {
    message = `Not Found - ${error.message}`;
  } else if (error.name === _DATABASE_CONFLICT_ERROR_NAME_) {
    message = `Conflict - ${error.message}`;
  }

  return message;
}
