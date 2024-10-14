import { Context } from '@src/infra/context/Context';
import { ISerializedError } from '@src/infra/exceptions/ISerializedError';

/**
 * Base class for custom errors.
 * @abstract
 * @class BaseError
 * @extends {Error}
 */
export abstract class BaseError extends Error {
  abstract code: string;

  abstract name: string;

  public readonly correlationId: string;

  /**
   * @param {string} message
   * @param {ObjectLiteral} [metadata={}]
   */
  constructor(
    readonly message: string,
    readonly cause?: Error,
    readonly metadata?: unknown
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    const store: Map<any, any> = Context.getStore() as Map<any, any>;
    this.correlationId = store ? store.get('correlationId') : '';
  }

  toJSON(): ISerializedError {
    return {
      message: this.message,
      code: this.code,
      stack: this.stack,
      correlationId: this.correlationId,
      cause: JSON.stringify(this.cause),
      metadata: this.metadata
    };
  }
}
