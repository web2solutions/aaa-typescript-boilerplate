import {
  ConflictError,
  DataBaseNotFoundError,
  DatabasePagingError,
  DomainNotFoundError,
  DomainValidationError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  ResourceLockedError,
  UnauthorizedError,
  ValidationError
} from '@src/infra/exceptions';
import { NotImplemented } from '@src/infra/exceptions/NotImplemented';
import { Context } from '@src/infra/context/Context';
import {
  buildErrorResponsePayload,
  formatErrorMessage,
  isProductionEnv,
  replaceVars,
  shouldExposeInternalErrors,
  toHttpStatus
} from '@src/shared/utils';

describe('error exposure by environment', () => {
  const error = new ValidationError('invalid payload');

  it('exposes internal error details in dev/staging', () => {
    expect.assertions(2);
    const devPayload = buildErrorResponsePayload(error, { NODE_ENV: 'dev' } as NodeJS.ProcessEnv);
    const stagingPayload = buildErrorResponsePayload(error, { NODE_ENV: 'staging' } as NodeJS.ProcessEnv);

    expect(devPayload.error).toBe(error);
    expect(stagingPayload.error).toBe(error);
  });

  it('masks internal error details in production/prod', () => {
    expect.assertions(2);
    const productionPayload = buildErrorResponsePayload(error, { NODE_ENV: 'production' } as NodeJS.ProcessEnv);
    const prodPayload = buildErrorResponsePayload(error, { NODE_ENV: 'prod' } as NodeJS.ProcessEnv);

    expect(productionPayload.error).toBeUndefined();
    expect(prodPayload.error).toBeUndefined();
  });

  it('covers utility helpers for path, status and env gates', () => {
    expect.assertions(5);
    expect(replaceVars('/users/{id}/emails/{emailId}')).toBe('/users/:id/emails/:emailId');
    expect(toHttpStatus('GENERIC.INVALID_INPUT' as any)).toBe(400);
    expect(isProductionEnv({ NODE_ENV: 'prod' } as NodeJS.ProcessEnv)).toBe(true);
    expect(isProductionEnv({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toBe(true);
    expect(shouldExposeInternalErrors({ NODE_ENV: 'dev' } as NodeJS.ProcessEnv)).toBe(true);
  });

  it('covers utility helpers for production env exposure gate', () => {
    expect.assertions(1);
    expect(shouldExposeInternalErrors({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toBe(false);
  });

  it('normalizes NODE_ENV before production check', () => {
    expect.assertions(1);
    expect(isProductionEnv({ NODE_ENV: ' PRODUCTION ' } as NodeJS.ProcessEnv)).toBe(true);
  });

  it('covers bad-request and auth/lock message mapping branches', () => {
    expect.assertions(5);
    expect(formatErrorMessage(new ValidationError('a'))).toBe('Bad Request - a');
    expect(formatErrorMessage(new DomainValidationError('b'))).toBe('Bad Request - b');
    expect(formatErrorMessage(new DatabasePagingError('c'))).toBe('Bad Request - c');
    expect(formatErrorMessage(new ForbiddenError('d'))).toBe('Forbidden - d');
    expect(formatErrorMessage(new UnauthorizedError('e'))).toBe('Unauthorized - e');
  });

  it('covers not-found and conflict message mapping branches', () => {
    expect.assertions(4);
    expect(formatErrorMessage(new ResourceLockedError('f'))).toBe('Locked - f');
    expect(formatErrorMessage(new NotFoundError('g'))).toBe('Not Found - g');
    expect(formatErrorMessage(new DomainNotFoundError('h'))).toBe('Not Found - h');
    expect(formatErrorMessage(new DataBaseNotFoundError('i'))).toBe('Not Found - i');
  });

  it('covers conflict mapping branch explicitly', () => {
    expect.assertions(1);
    expect(formatErrorMessage(new ConflictError('j'))).toBe('Conflict - j');
  });

  it('returns not implemented and default-empty messages for unmatched names', () => {
    expect.assertions(2);
    expect(formatErrorMessage(new InternalServerError('x'))).toBe('');
    expect(formatErrorMessage(new NotImplemented('y'))).toBe('Not Implemented - y');
  });

  it('covers event-invalid-message branch and default env-based helpers', () => {
    expect.assertions(4);
    const eventInvalidMessageError = new ValidationError('evt');
    Object.defineProperty(eventInvalidMessageError, 'name', { value: 'event_invalid_message' });
    expect(formatErrorMessage(eventInvalidMessageError)).toBe('Bad Request - evt');

    process.env.NODE_ENV = 'production';
    expect(isProductionEnv()).toBe(true);
    expect(shouldExposeInternalErrors()).toBe(false);
    expect(buildErrorResponsePayload(new ValidationError('z')).error).toBeUndefined();
  });

  it('includes correlation id when available in context', () => {
    expect.assertions(1);
    Context.run(new Map([['correlationId', 'corr-123']]), () => {
      const payload = buildErrorResponsePayload(new ValidationError('ctx'), { NODE_ENV: 'production' } as NodeJS.ProcessEnv);
      expect(payload.correlationId).toBe('corr-123');
    });
  });
});
