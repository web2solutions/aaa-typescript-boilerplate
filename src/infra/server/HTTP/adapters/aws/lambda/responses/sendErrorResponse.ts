import {
  _VALIDATION_ERROR_NAME_,
  _DOMAIN_VALIDATION_ERROR_NAME_,
  _FORBIDDEN_ERROR_NAME_,
  _NOT_FOUND_ERROR_NAME_,
  _DOMAIN_NOT_FOUND_ERROR_NAME_,
  _DATABASE_NOT_FOUND_ERROR_NAME_,
  _DATABASE_DUPLICATED_RECORD_ERROR_NAME_,
  _EVENT_INVALID_MESSAGE_,
  _UNAUTHORIZED_ERROR_NAME_,
  // _INFRA_NOT_IMPLEMENTED_,
  _DATABASE_PAGING_ERROR_

} from '@src/infra/config/constants';

export function sendErrorResponse(error: Error) {
  let status = 500;
  let { message } = error;
  if (
    error.name === _VALIDATION_ERROR_NAME_
    || error.name === _DOMAIN_VALIDATION_ERROR_NAME_
    || error.name === _EVENT_INVALID_MESSAGE_
    || error.name === _DATABASE_PAGING_ERROR_
  ) {
    status = 400;
    message = `Bad Request - ${error.message}`;
  } else if (error.name === _FORBIDDEN_ERROR_NAME_) {
    status = 403;
    message = `Forbidden - ${error.message}`;
  } else if (error.name === _UNAUTHORIZED_ERROR_NAME_) {
    status = 401;
    message = `Unauthorized - ${error.message}`;
  } else if (
    error.name === _NOT_FOUND_ERROR_NAME_
    || error.name === _DOMAIN_NOT_FOUND_ERROR_NAME_
    || error.name === _DATABASE_NOT_FOUND_ERROR_NAME_
  ) {
    status = 404;
    message = `Not Found - ${error.message}`;
  } else if (error.name === _DATABASE_DUPLICATED_RECORD_ERROR_NAME_) {
    status = 409;
    message = `Duplicated record - ${error.message}`;
  } /* else if (error.name === _INFRA_NOT_IMPLEMENTED_) {
    status = 501;
    message = `Not implemented - ${error.message}`;
  } */
  return {
    statusCode: status,
    body: JSON.stringify({
      message,
      error,
      stack: error.stack
    })
  };
}
