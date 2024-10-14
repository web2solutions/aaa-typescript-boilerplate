import {
  _PASSWORD_MIN_LENGTH_
} from '@src/config/constants';
import { DomainNotFoundError, DomainValidationError } from '@src/infra/exceptions';

export function throwIfNotFound(found: boolean) {
  if (!found) {
    throw new DomainNotFoundError('Record not found');
  }
}

export function throwIfValuesAreDifferent(values: any[]) {
  const set = new Set(values);
  if (set.size === values.length) {
    throw new DomainValidationError('The provided values are different');
  }
}

export function throwIfIsNotObject(field: string, value: any) {
  if (
    (typeof value !== 'object')
    || (typeof value === 'object' && Array.isArray(value))
  ) {
    throw new DomainValidationError(`The property ${field} must be an object`);
  }
}

export function canNotWriteDirectly(field: string) {
  throw new DomainValidationError(`The property ${field} can not be directly changed`);
}

export function mustBeNumeric(field: string, value: number) {
  if (typeof value !== 'number') throw new DomainValidationError(`${field} must be a number`);
}

export function mustBePassword(field: string, value: string) {
  let errorMessage = '';
  if (typeof value !== 'string') errorMessage = `${field} must be a string.`;

  if (value.length < _PASSWORD_MIN_LENGTH_) errorMessage = `${field} must have at least 8 chars.`;

  if (errorMessage !== '') throw new DomainValidationError(errorMessage);
}

export function mustBeArray<T>(field: string, value: T[]) {
  if (!Array.isArray(value)) throw new DomainValidationError(`${field} must be an array`);
}

export function mustBeGreaterThanZero(field: string, value: number) {
  let msg = '';
  if (typeof value !== 'number') {
    msg = `${field} must be a number.`;
  }
  if (value <= 0) {
    msg = `${field} must be greater than 0`;
  }
  if (msg !== '') {
    throw new DomainValidationError(msg);
  }
}

export function mustBePositiveNumber(field: string, value: number) {
  let msg = '';
  if (typeof value !== 'number') {
    msg = `${field} must be a number.`;
  }
  if (value < 0) {
    msg = `${field} must be a positive number`;
  }
  if (msg !== '') {
    throw new DomainValidationError(msg);
  }
}

export function throwIfReadOnly(field: string, value: boolean) {
  if (value) throw new DomainValidationError(`Can not write to ${field}. The model is read only`);
}

export function throwIfPreUpdateValidationFails(id: string, data: any) {
  let errorMessage = '';
  if (id !== data.id) {
    errorMessage = 'id and data.id must match';
  }
  if (errorMessage !== '') {
    throw new DomainValidationError(errorMessage);
  }
}

export function canNotBeEmpty(field: string, value: any) {
  const msg = `${field} can not be empty`;
  if (typeof value === 'undefined') throw new DomainValidationError(msg);
  if (value === null) throw new DomainValidationError(msg);

  if (typeof value === 'string') if (value === '') throw new DomainValidationError(msg);

  if (typeof value === 'object' && (!Array.isArray(value))) {
    if (Object.keys(value).length === 0) throw new DomainValidationError(msg);
  } else if (typeof value === 'object' && (Array.isArray(value))) {
    if (value.length === 0) throw new DomainValidationError(msg);
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

  const error = new DomainValidationError(`Event must ends in at least ${minutesIntheFuture} minutes in the future`);

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
