import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { BaseError } from '@src/infra/exceptions';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/aws/lambda/responses/sendErrorResponse';
import {
  LoginRequestEvent,
  LogoutRequestEvent,
  RegisterRequestEvent,
  UpdatePasswordRequestEvent,
  UserCreateRequestEvent,
  UserDeleteRequestEvent,
  UserDocumentCreateRequestEvent,
  UserDocumentDeleteRequestEvent,
  UserDocumentUpdateRequestEvent,
  UserEmailCreateRequestEvent,
  UserEmailDeleteRequestEvent,
  UserEmailUpdateRequestEvent,
  UserGetAllRequestEvent,
  UserGetOneRequestEvent,
  UserPasswordUpdateRequestEvent,
  UserPhoneCreateRequestEvent,
  UserPhoneDeleteRequestEvent,
  UserPhoneUpdateRequestEvent,
  UserUpdateRequestEvent
} from '@src/modules/Users';
import { OrganizationCreateRequestEvent } from '@src/modules/Users/events/OrganizationCreateRequestEvent';
import { OrganizationGetAllRequestEvent } from '@src/modules/Users/events/OrganizationGetAllRequestEvent';
import { OrganizationGetOneRequestEvent } from '@src/modules/Users/events/OrganizationGetOneRequestEvent';
import { OrganizationUpdateRequestEvent } from '@src/modules/Users/events/OrganizationUpdateRequestEvent';
import { OrganizationDeleteRequestEvent } from '@src/modules/Users/events/OrganizationDeleteRequestEvent';
import {
  authController,
  userController,
  getSchemaOAS,
  withLambdaContext
} from './runtime';

type OperationId =
  | 'login'
  | 'logout'
  | 'register'
  | 'updateUserPassword'
  | 'create'
  | 'getAll'
  | 'deleteOne'
  | 'update'
  | 'getOneById'
  | 'updatePassword'
  | 'createEmail'
  | 'updateEmail'
  | 'deleteEmail'
  | 'createDocument'
  | 'updateDocument'
  | 'deleteDocument'
  | 'createPhone'
  | 'updatePhone'
  | 'deletePhone'
  | 'createOrganization'
  | 'getAllOrganizations'
  | 'getOrganizationById'
  | 'updateOrganization'
  | 'deleteOrganization';

type OperationConfig = {
  statusCode: number;
  controllerKey: keyof typeof userController | keyof typeof authController;
  target: 'user' | 'auth';
  EventClass: new (input: any) => any;
};

const OPERATION_CONFIG: Record<OperationId, OperationConfig> = {
  login: {
    target: 'auth', controllerKey: 'login', EventClass: LoginRequestEvent, statusCode: 200
  },
  logout: {
    target: 'auth', controllerKey: 'logout', EventClass: LogoutRequestEvent, statusCode: 200
  },
  register: {
    target: 'auth', controllerKey: 'register', EventClass: RegisterRequestEvent, statusCode: 201
  },
  updateUserPassword: {
    target: 'auth',
    controllerKey: 'updatePassword',
    EventClass: UpdatePasswordRequestEvent,
    statusCode: 200
  },
  create: {
    target: 'user', controllerKey: 'create', EventClass: UserCreateRequestEvent, statusCode: 201
  },
  getAll: {
    target: 'user', controllerKey: 'getAll', EventClass: UserGetAllRequestEvent, statusCode: 200
  },
  deleteOne: {
    target: 'user', controllerKey: 'delete', EventClass: UserDeleteRequestEvent, statusCode: 200
  },
  update: {
    target: 'user', controllerKey: 'update', EventClass: UserUpdateRequestEvent, statusCode: 200
  },
  getOneById: {
    target: 'user', controllerKey: 'getOneById', EventClass: UserGetOneRequestEvent, statusCode: 200
  },
  updatePassword: {
    target: 'user',
    controllerKey: 'updatePassword',
    EventClass: UserPasswordUpdateRequestEvent,
    statusCode: 200
  },
  createEmail: {
    target: 'user', controllerKey: 'createEmail', EventClass: UserEmailCreateRequestEvent, statusCode: 201
  },
  updateEmail: {
    target: 'user', controllerKey: 'updateEmail', EventClass: UserEmailUpdateRequestEvent, statusCode: 200
  },
  deleteEmail: {
    target: 'user', controllerKey: 'deleteEmail', EventClass: UserEmailDeleteRequestEvent, statusCode: 200
  },
  createDocument: {
    target: 'user',
    controllerKey: 'createDocument',
    EventClass: UserDocumentCreateRequestEvent,
    statusCode: 201
  },
  updateDocument: {
    target: 'user',
    controllerKey: 'updateDocument',
    EventClass: UserDocumentUpdateRequestEvent,
    statusCode: 200
  },
  deleteDocument: {
    target: 'user',
    controllerKey: 'deleteDocument',
    EventClass: UserDocumentDeleteRequestEvent,
    statusCode: 200
  },
  createPhone: {
    target: 'user', controllerKey: 'createPhone', EventClass: UserPhoneCreateRequestEvent, statusCode: 201
  },
  updatePhone: {
    target: 'user', controllerKey: 'updatePhone', EventClass: UserPhoneUpdateRequestEvent, statusCode: 200
  },
  deletePhone: {
    target: 'user', controllerKey: 'deletePhone', EventClass: UserPhoneDeleteRequestEvent, statusCode: 200
  },
  createOrganization: {
    target: 'user', controllerKey: 'createOrganization', EventClass: OrganizationCreateRequestEvent, statusCode: 201
  },
  getAllOrganizations: {
    target: 'user', controllerKey: 'getAllOrganizations', EventClass: OrganizationGetAllRequestEvent, statusCode: 200
  },
  getOrganizationById: {
    target: 'user', controllerKey: 'getOrganizationById', EventClass: OrganizationGetOneRequestEvent, statusCode: 200
  },
  updateOrganization: {
    target: 'user', controllerKey: 'updateOrganization', EventClass: OrganizationUpdateRequestEvent, statusCode: 200
  },
  deleteOrganization: {
    target: 'user', controllerKey: 'deleteOrganization', EventClass: OrganizationDeleteRequestEvent, statusCode: 200
  }
};

const parseBody = (body: APIGatewayProxyEvent['body']) => {
  if (!body) return {};
  if (typeof body === 'object') return body;
  try {
    return JSON.parse(body);
  } catch (error) {
    return body;
  }
};

export const createLambdaOperationHandler = (operationId: OperationId): Handler => {
  const operation = OPERATION_CONFIG[operationId];

  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return withLambdaContext(event, async () => {
      try {
        const headers = event.headers || {};
        const authorization = headers.authorization || headers.Authorization || '';
        const schemaOAS = getSchemaOAS(event);
        const controller: any = operation.target === 'user' ? userController : authController;
        const method = controller[operation.controllerKey] as any;

        const domainEvent = new operation.EventClass({
          authorization,
          input: parseBody(event.body),
          params: event.pathParameters || {},
          queryString: event.queryStringParameters || {},
          schemaOAS
        });

        const {
          result, error, page, size, total
        } = await method.bind(controller)(domainEvent);
        if (error) throw error;

        const body = operationId === 'getAll' || operationId === 'getAllOrganizations'
          ? {
            result, error, page, size, total
          }
          : { result, error };

        return {
          statusCode: operation.statusCode,
          body: JSON.stringify(body)
        };
      } catch (error: unknown) {
        return sendErrorResponse(error as BaseError);
      }
    });
  };
};
