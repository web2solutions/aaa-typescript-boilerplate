import {
  _DOMAIN_VALIDATION_ERROR_NAME_,
  _DOMAIN_NOT_FOUND_ERROR_NAME_
} from '@src/infra/config/constants';

export function throwIfNotFound(found: boolean) {
  if (!found) {
    const error = new Error('Record not found');
    error.name = _DOMAIN_NOT_FOUND_ERROR_NAME_;
    throw error;
  }
}

export function canNotWriteDirectly(field: string) {
  const error = new Error(`The property ${field} can not be directly changed`);
  error.name = _DOMAIN_VALIDATION_ERROR_NAME_;
  throw error;
}

export function mustBeNumeric(field: string, value: number) {
  const error = new Error(`${field} must be a number`);
  error.name = _DOMAIN_VALIDATION_ERROR_NAME_;

  if (typeof value !== 'number') throw error;
}

export function mustBePassword(field: string, value: string) {
  let errorMessage = '';
  if (typeof value !== 'string') errorMessage = `${field} must be a string.`;

  if (value.length < 8) errorMessage = `${field} must have at least 8 chars.`;

  const error = new Error(errorMessage);
  error.name = _DOMAIN_VALIDATION_ERROR_NAME_;

  if (errorMessage !== '') throw error;
}

export function mustBeArray<T>(field: string, value: T[]) {
  const error = new Error(`${field} must be an array`);
  error.name = _DOMAIN_VALIDATION_ERROR_NAME_;

  if (!Array.isArray(value)) throw error;
}

export function mustBeGreaterThanZero(field: string, value: number) {
  const error = new Error(`${field} must be greater than 0`);
  error.name = _DOMAIN_VALIDATION_ERROR_NAME_;

  if (value <= 0) throw error;
}

export function mustBePositiveNumber(field: string, value: number) {
  const error = new Error(`${field} must be a positive number`);
  error.name = _DOMAIN_VALIDATION_ERROR_NAME_;
  if (value < 0) throw error;
}

export function throwIfReadOnly(field: string, value: boolean) {
  const error = new Error(`Can not write to ${field}. The model is read only`);
  error.name = _DOMAIN_VALIDATION_ERROR_NAME_;
  if (value) throw error;
}

export function canNotBeEmpty(field: string, value: any) {
  const error = new Error(`${field} can not be empty`);
  error.name = _DOMAIN_VALIDATION_ERROR_NAME_;

  if (typeof value === 'undefined') throw error;
  if (value === null) throw error;

  if (typeof value === 'string') if (value === '') throw error;

  if (typeof value === 'object' && (!Array.isArray(value))) {
    if (Object.keys(value).length === 0) throw error;
    else if (typeof value === 'object' && (Array.isArray(value))) if (value.length === 0) throw error;
  }
}
export function mustEndsAtLeastInMinutes(_eventDate: Date, minutesIntheFuture: number): void {
  const eventDate = new Date(_eventDate);

  const dateNow = new Date();
  const hourNow = dateNow.getHours();
  const minutesNow = dateNow.getMinutes();
  const dayNow = dateNow.getDate();
  const monthNow = dateNow.getUTCMonth() + 1;
  const yearNow = dateNow.getUTCFullYear();
  // console.log({ hourNow, minutesNow, dayNow, monthNow, yearNow })

  const hourEvent = eventDate.getHours();
  const minutesEvent = eventDate.getMinutes();
  const dayEvent = eventDate.getDate();
  const monthEvent = eventDate.getUTCMonth() + 1;
  const yearEvent = eventDate.getUTCFullYear();
  // console.log({ hourEvent, minutesEvent, dayEvent, monthEvent, yearEvent });

  const error = new Error(`Event must ends in at least ${minutesIntheFuture} minutes in the future`);
  error.name = _DOMAIN_VALIDATION_ERROR_NAME_;

  if (yearNow > yearEvent) throw error;

  if (yearNow === yearEvent && monthNow > monthEvent) throw error;

  if (dayNow > dayEvent) throw error;

  // yearEvent now is >= yearNow
  // monthEvent now is >= monthNow
  // dayEvent is now >= dayNow
  if (dayNow === dayEvent) {
    if (hourNow > hourEvent) throw error;
    else if (hourNow === hourEvent) {
      if ((minutesEvent - minutesNow) < minutesIntheFuture) throw error;
    }
  }
}
