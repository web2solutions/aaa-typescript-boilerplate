/* eslint-disable jest/max-expects, jest/prefer-called-with, jest/require-to-throw-message */
import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { AuthController } from '@src/modules/Users/adapters/in/http/controllers/AuthController';
import { UserController } from '@src/modules/Users/adapters/in/http/controllers/UserController';

jest.mock<typeof import('@src/interface/HTTP/validators')>('@src/interface/HTTP/validators', () => ({
  ...jest.requireActual('@src/interface/HTTP/validators'),
  throwIfOASInputValidationFails: jest.fn(),
  validateRequestParams: jest.fn()
}));

class TestEvent extends BaseDomainEvent {}

const makeFactory = (overrides: Record<string, any> = {}) => {
  const authService = {
    authenticate: jest.fn(),
    authorize: jest.fn().mockResolvedValue({ id: 'u1' }),
    throwIfUserHasNoAccessToResource: jest.fn()
  };

  return {
    authService,
    openApiSpecification: {},
    databaseClient: { stores: {} },
    userUseCases: {
      create: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      update: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      updatePassword: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      delete: jest.fn().mockResolvedValue({ result: true }),
      getOneById: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      getAll: jest.fn().mockResolvedValue({
        result: [], page: 1, size: 10, total: 0
      }),
      createDocument: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      updateDocument: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      deleteDocument: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      createPhone: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      updatePhone: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      deletePhone: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      createEmail: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      updateEmail: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      deleteEmail: jest.fn().mockResolvedValue({ result: { id: 'u1' } })
    },
    authUseCases: {
      login: jest.fn().mockResolvedValue({ result: { token: 't' } }),
      register: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      updatePassword: jest.fn().mockResolvedValue({ result: true }),
      logout: jest.fn().mockResolvedValue({ result: true })
    },
    ...overrides
  };
};

const makeEvent = (overrides: Record<string, any> = {}) => new TestEvent({
  authorization: 'Bearer token',
  input: { username: 'john', password: '12345678' },
  params: {
    id: 'u1', documentId: 'd1', phoneId: 'p1', emailId: 'e1'
  },
  queryString: {
    filter: Buffer.from(JSON.stringify({ username: 'john' })).toString('base64'),
    page: '1',
    size: '10'
  },
  schemaOAS: { operationId: 'usersCreate' },
  ...overrides
});

describe('users controllers', () => {
  it('covers auth controller public methods', async () => {
    expect.hasAssertions();
    const factory = makeFactory();
    const controller = new AuthController(factory as any);
    const event = makeEvent();

    await controller.login(event);
    await controller.register(event);
    await controller.updatePassword(event);
    await controller.logout(event);

    expect(factory.authUseCases.login).toHaveBeenCalled();
    expect(factory.authUseCases.register).toHaveBeenCalled();
    expect(factory.authUseCases.updatePassword).toHaveBeenCalledWith('Bearer token', event.input);
    expect(factory.authUseCases.logout).toHaveBeenCalledWith('Bearer token', event.input);
    expect(factory.authService.authorize).toHaveBeenCalled();
    expect(AuthController.compile(factory as any)).toBeInstanceOf(AuthController);
  });

  it('covers user controller public methods', async () => {
    expect.hasAssertions();
    const factory = makeFactory();
    const controller = new UserController(factory as any);
    const event = makeEvent();

    await controller.create(event);
    await controller.update(event);
    await controller.updatePassword(event);
    await controller.delete(event);
    await controller.getOneById(event);
    await controller.getAll(event);
    await controller.createDocument(event);
    await controller.updateDocument(event);
    await controller.deleteDocument(event);
    await controller.createPhone(event);
    await controller.updatePhone(event);
    await controller.deletePhone(event);
    await controller.createEmail(event);
    await controller.updateEmail(event);
    await controller.deleteEmail(event);

    expect(factory.userUseCases.create).toHaveBeenCalled();
    expect(factory.userUseCases.update).toHaveBeenCalledWith('u1', event.input);
    expect(factory.userUseCases.getAll).toHaveBeenCalled();
    expect(factory.userUseCases.deleteEmail).toHaveBeenCalledWith('u1', 'e1');
    expect(factory.authService.authorize).toHaveBeenCalled();
    expect(UserController.compile(factory as any)).toBeInstanceOf(UserController);
  });

  it('throws when required dependencies are missing', () => {
    expect.hasAssertions();
    const factory = makeFactory();
    expect(() => new AuthController({ ...factory, authUseCases: undefined } as any)).toThrow();
    expect(() => new UserController({ ...factory, userUseCases: undefined } as any)).toThrow();
  });
});
