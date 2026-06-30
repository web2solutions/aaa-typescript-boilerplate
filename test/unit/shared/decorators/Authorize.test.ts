import { Authorize } from '@src/shared/decorators/guard/Authorize';

class DecoratedHandler {
  public messageMediator: any;

  public authService: any;

  public async run(event: any): Promise<any> {
    return { ...event, touchedByInstance: Boolean(this) };
  }
}

const applyAuthorize = (): void => {
  const descriptor = Object.getOwnPropertyDescriptor(DecoratedHandler.prototype, 'run');
  if (!descriptor) throw new Error('missing descriptor');
  Authorize()(DecoratedHandler.prototype, 'run', descriptor);
  Object.defineProperty(DecoratedHandler.prototype, 'run', descriptor);
};

describe('authorize decorator', () => {
  beforeAll(() => {
    applyAuthorize();
  });

  it('authorizes using message mediator and writes metadata user id', async () => {
    expect.hasAssertions();
    const handler = new DecoratedHandler();
    handler.messageMediator = {
      request: jest.fn().mockResolvedValue({
        result: { id: 'u1' },
        error: undefined
      })
    };

    const event = await handler.run({
      authorization: 'Bearer token',
      schemaOAS: { scopes: ['read_user'] },
      metadata: {}
    });

    expect(event.authenticatedUser.id).toBe('u1');
    expect(event.metadata.userId).toBe('u1');
  });

  it('throws when mediator returns error', async () => {
    expect.hasAssertions();
    const handler = new DecoratedHandler();
    handler.messageMediator = {
      request: jest.fn().mockResolvedValue({
        result: undefined,
        error: new Error('denied')
      })
    };
    await expect(handler.run({ authorization: 'x', schemaOAS: {} })).rejects.toThrow('denied');
  });

  it('authorizes via auth service fallback when mediator is not available', async () => {
    expect.hasAssertions();
    const authorize = jest.fn().mockResolvedValue({ id: 'u2' });
    const throwIfUserHasNoAccessToResource = jest.fn();
    const handler = new DecoratedHandler();
    handler.authService = {
      authorize,
      throwIfUserHasNoAccessToResource
    };

    const event = await handler.run({
      authorization: 'Basic abc',
      schemaOAS: { scopes: ['read_user'] }
    });

    expect(authorize).toHaveBeenCalledWith('Basic abc');
    expect(throwIfUserHasNoAccessToResource).toHaveBeenCalledWith(
      { id: 'u2' },
      { scopes: ['read_user'] }
    );
    expect(event.authenticatedUser.id).toBe('u2');
  });

  it('writes empty metadata user id when authorized user has no id', async () => {
    expect.hasAssertions();
    const handler = new DecoratedHandler();
    handler.messageMediator = {
      request: jest.fn().mockResolvedValue({
        result: {},
        error: undefined
      })
    };

    const event = await handler.run({
      authorization: 'Bearer token',
      schemaOAS: { scopes: ['read_user'] },
      metadata: {}
    });

    expect(event.metadata.userId).toBe('');
  });
});
