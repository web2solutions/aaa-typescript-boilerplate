import * as exceptions from '@src/infra/exceptions';
import { BaseError } from '@src/infra/exceptions/BaseError';
import { NotImplemented } from '@src/infra/exceptions/NotImplemented';

describe('infra exceptions', () => {
  it('instantiates all public custom exceptions', () => {
    expect.hasAssertions();

    const targets = [
      exceptions.ComposeEventError,
      exceptions.ConflictError,
      exceptions.DataBaseNotFoundError,
      exceptions.DatabasePagingError,
      exceptions.DomainNotFoundError,
      exceptions.DomainValidationError,
      exceptions.ForbiddenError,
      exceptions.InternalServerError,
      exceptions.NotFoundError,
      NotImplemented,
      exceptions.ResourceLockedError,
      exceptions.UnauthorizedError,
      exceptions.ValidationError
    ];

    for (const ExceptionCtor of targets) {
      const error = new ExceptionCtor('boom');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseError);
      expect(error.toJSON()).toStrictEqual(expect.objectContaining({ message: 'boom' }));
    }
  });

  it('serializes BaseError with metadata and cause', () => {
    expect.hasAssertions();
    const error = new exceptions.ValidationError('invalid', new Error('cause'), { id: '1' });
    const serialized = error.toJSON();
    expect(serialized.message).toBe('invalid');
    expect(serialized.code).toBeDefined();
    expect(serialized.cause).toBeDefined();
    expect(serialized.metadata).toStrictEqual({ id: '1' });
  });
});
