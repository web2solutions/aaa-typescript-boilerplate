import HyperExpress from 'hyper-express';

import {
  _VALIDATION_ERROR_NAME_,
  _DOMAIN_VALIDATION_ERROR_NAME_,
  _FORBIDDEN_ERROR_NAME_,
  _NOT_FOUND_ERROR_NAME_,
  _DOMAIN_NOT_FOUND_ERROR_NAME_,
  _DATABASE_NOT_FOUND_ERROR_NAME_,
  _DATABASE_DUPLICATED_RECORD_ERROR_NAME_

} from '@src/infra/config/constants';

export function sendErrorResponse(error: Error, res: HyperExpress.Response) {
  let status = 500;
  let { message } = error;
  if (
    error.name === _VALIDATION_ERROR_NAME_
    || error.name === _DOMAIN_VALIDATION_ERROR_NAME_
  ) {
    status = 400;
    message = `Bad Request - ${error.message}`;
  } else if (error.name === _FORBIDDEN_ERROR_NAME_) {
    status = 403;
    message = `Forbidden - ${error.message}`;
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
  }
  res.status(status).json({
    message,
    error,
    stack: error.stack
  });
}
