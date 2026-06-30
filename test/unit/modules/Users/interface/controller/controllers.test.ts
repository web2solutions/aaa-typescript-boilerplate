/* eslint-disable jest/max-expects, jest/prefer-called-with, jest/require-to-throw-message */
import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { AuthController } from '@src/modules/Users/adapters/in/http/controllers/AuthController';
import { OrganizationController } from '@src/modules/Users/adapters/in/http/controllers/OrganizationController';
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
    organizationUseCases: {
      create: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      update: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1 Updated' } }),
      delete: jest.fn().mockResolvedValue({ result: true }),
      getOneById: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      getAll: jest.fn().mockResolvedValue({
        result: [], page: 1, size: 10, total: 0
      }),
      createAddress: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      updateAddress: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      deleteAddress: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      createPhone: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      updatePhone: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      deletePhone: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      createEmail: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      updateEmail: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } }),
      deleteEmail: jest.fn().mockResolvedValue({ result: { id: 'o1', name: 'Org 1' } })
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
    id: 'u1', documentId: 'd1', phoneId: 'p1', emailId: 'e1', addressId: 'a1'
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

  it('covers organization controller public methods', async () => {
    expect.hasAssertions();
    const factory = makeFactory();
    const controller = new OrganizationController(factory as any);
    const event = makeEvent();

    await controller.create(event);
    await controller.update(event);
    await controller.delete(event);
    await controller.getOneById(event);
    await controller.getAll(event);
    await controller.createAddress(event);
    await controller.updateAddress(event);
    await controller.deleteAddress(event);
    await controller.createPhone(event);
    await controller.updatePhone(event);
    await controller.deletePhone(event);
    await controller.createEmail(event);
    await controller.updateEmail(event);
    await controller.deleteEmail(event);
    await controller.createOrganization(event);
    await controller.updateOrganization(event);
    await controller.deleteOrganization(event);
    await controller.getOrganizationById(event);
    await controller.getAllOrganizations(event);
    await controller.createOrganizationAddress(event);
    await controller.updateOrganizationAddress(event);
    await controller.deleteOrganizationAddress(event);
    await controller.createOrganizationPhone(event);
    await controller.updateOrganizationPhone(event);
    await controller.deleteOrganizationPhone(event);
    await controller.createOrganizationEmail(event);
    await controller.updateOrganizationEmail(event);
    await controller.deleteOrganizationEmail(event);

    expect(factory.organizationUseCases.create).toHaveBeenCalledWith(event.input);
    expect(factory.organizationUseCases.update).toHaveBeenCalledWith('u1', event.input);
    expect(factory.organizationUseCases.delete).toHaveBeenCalledWith('u1');
    expect(factory.organizationUseCases.getOneById).toHaveBeenCalledWith('u1');
    expect(factory.organizationUseCases.getAll).toHaveBeenCalled();
    expect(factory.organizationUseCases.createAddress).toHaveBeenCalledWith('u1', event.input);
    expect(factory.organizationUseCases.updateAddress).toHaveBeenCalledWith('u1', 'a1', event.input);
    expect(factory.organizationUseCases.deleteAddress).toHaveBeenCalledWith('u1', 'a1');
    expect(factory.organizationUseCases.createPhone).toHaveBeenCalledWith('u1', event.input);
    expect(factory.organizationUseCases.updatePhone).toHaveBeenCalledWith('u1', 'p1', event.input);
    expect(factory.organizationUseCases.deletePhone).toHaveBeenCalledWith('u1', 'p1');
    expect(factory.organizationUseCases.createEmail).toHaveBeenCalledWith('u1', event.input);
    expect(factory.organizationUseCases.updateEmail).toHaveBeenCalledWith('u1', 'e1', event.input);
    expect(factory.organizationUseCases.deleteEmail).toHaveBeenCalledWith('u1', 'e1');
    expect(factory.authService.authorize).toHaveBeenCalled();
    expect(OrganizationController.compile(factory as any)).toBeInstanceOf(OrganizationController);
  });

  it('throws when required dependencies are missing', () => {
    expect.hasAssertions();
    const factory = makeFactory();
    expect(() => new AuthController({ ...factory, authUseCases: undefined } as any)).toThrow();
    expect(() => new UserController({ ...factory, userUseCases: undefined } as any)).toThrow();
    expect(() => new OrganizationController({
      ...factory,
      organizationUseCases: undefined
    } as any)).toThrow();
  });

  it('throws infra not implemented when organization use cases are missing for organization operations', () => {
    expect.hasAssertions();
    const factory = makeFactory({ organizationUseCases: undefined });
    expect(() => new OrganizationController(factory as any)).toThrow('OrganizationUseCases is not implemented');
  });

  it('uses message mediator in authorization decorator when available', async () => {
    expect.hasAssertions();
    const messageMediator = {
      request: jest.fn().mockResolvedValue({ result: { id: 'u1' } }),
      registerHandler: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn()
    };
    const factory = makeFactory({ messageMediator });
    const controller = new UserController(factory as any);

    await controller.delete(makeEvent());

    expect(messageMediator.request).toHaveBeenCalledWith(expect.objectContaining({
      contract: 'users.auth.ensure-access'
    }));
    expect(factory.authService.authorize).not.toHaveBeenCalled();
  });

  it('enforces tenant scope branches for user and organization operations', async () => {
    expect.hasAssertions();
    const factory = makeFactory({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn().mockResolvedValue({
          id: 'u-auth',
          roles: ['admin'],
          organization: 'org-1'
        }),
        throwIfUserHasNoAccessToResource: jest.fn()
      }
    });
    jest.spyOn(factory.userUseCases, 'getOneById').mockResolvedValue({
      result: { id: 'u-target', organization: 'org-2' }
    });
    const userController = new UserController(factory as any);
    const organizationController = new OrganizationController(factory as any);

    await expect(userController.update(makeEvent())).rejects.toThrow('cross organization access is forbidden');
    await expect(organizationController.update(makeEvent())).rejects.toThrow('cross organization access is forbidden');
  });

  it('enforces organization requirements for non-superadmin operations', async () => {
    expect.hasAssertions();
    const factory = makeFactory({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn().mockResolvedValue({
          id: 'u-auth',
          roles: ['admin']
        }),
        throwIfUserHasNoAccessToResource: jest.fn()
      }
    });
    const userController = new UserController(factory as any);
    const organizationController = new OrganizationController(factory as any);

    await expect(userController.create(makeEvent())).rejects.toThrow('organization scope is required');
    await expect(userController.getAll(makeEvent())).rejects.toThrow('organization scope is required');
    await expect(organizationController.getAll(makeEvent())).rejects.toThrow('organization scope is required');
    await expect(organizationController.create(makeEvent())).rejects.toThrow('only superadmin can create organizations');
  });

  it('applies organization/user filters for tenant-scoped getAll operations', async () => {
    expect.hasAssertions();
    const factory = makeFactory({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn().mockResolvedValue({
          id: 'u-auth',
          roles: ['user'],
          organization: 'org-1'
        }),
        throwIfUserHasNoAccessToResource: jest.fn()
      }
    });
    const userController = new UserController(factory as any);
    const organizationController = new OrganizationController(factory as any);
    await userController.getAll(makeEvent({
      queryString: {
        page: '1',
        size: '10'
      }
    }));
    expect(factory.userUseCases.getAll).toHaveBeenCalledWith(
      expect.objectContaining({
        organization: 'org-1',
        id: 'u-auth'
      }),
      expect.objectContaining({ page: 1, size: 10 })
    );

    await organizationController.getAll(makeEvent({
      queryString: {
        page: '1',
        size: '10'
      }
    }));
    expect(factory.organizationUseCases.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'org-1' }),
      expect.objectContaining({ page: 1, size: 10 })
    );
  });

  it('covers create-organization binding and own-user scope branches', async () => {
    expect.hasAssertions();
    const factory = makeFactory({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn().mockResolvedValue({
          id: 'u-auth',
          roles: ['admin'],
          organization: 'org-1'
        }),
        throwIfUserHasNoAccessToResource: jest.fn()
      }
    });
    jest.spyOn(factory.userUseCases, 'getOneById').mockResolvedValue({
      result: { id: 'u-auth', organization: 'org-1' }
    });
    const controller = new UserController(factory as any);

    const event = makeEvent({
      input: {
        username: 'john',
        password: '12345678'
      }
    });
    await controller.create(event);
    expect(factory.userUseCases.create).toHaveBeenCalledWith(expect.objectContaining({
      organization: 'org-1'
    }));

    await expect(controller.create(makeEvent({
      input: {
        username: 'john',
        password: '12345678',
        organization: 'org-2'
      }
    }))).rejects.toThrow('cross organization access is forbidden');

    await controller.update(makeEvent());
    expect(factory.userUseCases.update).toHaveBeenCalledWith('u1', expect.any(Object));
  });

  it('covers authorize decorator error branch when message mediator returns error', async () => {
    expect.hasAssertions();
    const messageMediator = {
      request: jest.fn().mockResolvedValue({ error: new Error('denied') }),
      registerHandler: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn()
    };
    const factory = makeFactory({ messageMediator });
    const controller = new UserController(factory as any);

    await expect(controller.delete(makeEvent())).rejects.toThrow('denied');
  });

  it('covers missing-organization guard branches for scoped operations', async () => {
    expect.hasAssertions();
    const factory = makeFactory({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn().mockResolvedValue({
          id: 'u-auth',
          roles: ['admin']
        }),
        throwIfUserHasNoAccessToResource: jest.fn()
      }
    });
    const userController = new UserController(factory as any);
    const organizationController = new OrganizationController(factory as any);

    await expect(userController.update(makeEvent())).rejects.toThrow('organization scope is required');
    await expect(organizationController.update(makeEvent())).rejects.toThrow('organization scope is required');
  });

  it('covers target-user-unavailable guard branch in scoped user operations', async () => {
    expect.hasAssertions();
    const factory = makeFactory({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn().mockResolvedValue({
          id: 'u-auth',
          roles: ['admin'],
          organization: 'org-1'
        }),
        throwIfUserHasNoAccessToResource: jest.fn()
      }
    });
    jest.spyOn(factory.userUseCases, 'getOneById').mockResolvedValue({
      error: new Error('lookup failed')
    });
    const controller = new UserController(factory as any);

    await expect(controller.update(makeEvent())).rejects.toThrow('lookup failed');
  });

  it('writes authenticated user id into event metadata when provided', async () => {
    expect.hasAssertions();
    const factory = makeFactory({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn().mockResolvedValue({
          id: 'u-auth',
          roles: ['superadmin']
        }),
        throwIfUserHasNoAccessToResource: jest.fn()
      }
    });
    const controller = new UserController(factory as any);
    const event = makeEvent({ metadata: {} });

    await controller.delete(event);
    expect((event as any).metadata.userId).toBe('u-auth');
  });

  it('allows superadmin organization operations without tenant filter enforcement', async () => {
    expect.hasAssertions();
    const factory = makeFactory({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn().mockResolvedValue({
          id: 'u-super',
          roles: ['superadmin']
        }),
        throwIfUserHasNoAccessToResource: jest.fn()
      }
    });
    const controller = new OrganizationController(factory as any);

    await controller.getAll(makeEvent({
      queryString: {
        page: '1',
        size: '10'
      }
    }));

    expect(factory.organizationUseCases.getAll).toHaveBeenCalledWith(
      expect.not.objectContaining({ id: expect.any(String) }),
      expect.objectContaining({ page: 1, size: 10 })
    );
  });

  it('covers organization controller auth-user fallback and superadmin scoped update branch', async () => {
    expect.hasAssertions();
    const factory = makeFactory({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn().mockResolvedValue({
          id: 'u-super',
          roles: ['superadmin']
        }),
        throwIfUserHasNoAccessToResource: jest.fn()
      }
    });
    const controller = new OrganizationController(factory as any);
    const authUser = (controller as any).getAuthenticatedUser(makeEvent({
      authenticatedUser: undefined
    }));
    expect(authUser).toStrictEqual({});

    await controller.update(makeEvent({
      params: { id: 'org-1' },
      input: { name: 'Org Updated' }
    }));
    expect(factory.organizationUseCases.update).toHaveBeenCalledWith('org-1', { name: 'Org Updated' });
  });
});
