import { APIGatewayProxyEvent } from 'aws-lambda';

import { handler as loginHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/login';
import { handler as logoutHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/logout';
import { handler as registerHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/register';
import { handler as updateUserPasswordHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updateUserPassword';
import { handler as createHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/create';
import { handler as getAllHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/getAll';
import { handler as deleteOneHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/deleteOne';
import { handler as updateHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/update';
import { handler as getOneByIdHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/getOneById';
import { handler as updatePasswordHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updatePassword';
import { handler as createEmailHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/createEmail';
import { handler as updateEmailHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updateEmail';
import { handler as deleteEmailHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/deleteEmail';
import { handler as createDocumentHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/createDocument';
import { handler as updateDocumentHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updateDocument';
import { handler as deleteDocumentHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/deleteDocument';
import { handler as createPhoneHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/createPhone';
import { handler as updatePhoneHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updatePhone';
import { handler as deletePhoneHandler } from '@src/modules/Users/interface/api/frameworks/aws/lambda/handlers/deletePhone';

type RouteDef = {
  method: string;
  template: string;
  handler: any;
};

const routes: RouteDef[] = [
  { method: 'POST', template: '/api/1.0.0/auth/login', handler: loginHandler },
  { method: 'POST', template: '/api/1.0.0/auth/logout', handler: logoutHandler },
  { method: 'POST', template: '/api/1.0.0/auth/register', handler: registerHandler },
  { method: 'POST', template: '/api/1.0.0/auth/updateUserPassword', handler: updateUserPasswordHandler },
  { method: 'GET', template: '/api/1.0.0/users', handler: getAllHandler },
  { method: 'POST', template: '/api/1.0.0/users', handler: createHandler },
  { method: 'GET', template: '/api/1.0.0/users/:id', handler: getOneByIdHandler },
  { method: 'PUT', template: '/api/1.0.0/users/:id', handler: updateHandler },
  { method: 'DELETE', template: '/api/1.0.0/users/:id', handler: deleteOneHandler },
  { method: 'PUT', template: '/api/1.0.0/users/:id/updatePassword', handler: updatePasswordHandler },
  { method: 'POST', template: '/api/1.0.0/users/:id/createEmail', handler: createEmailHandler },
  { method: 'PUT', template: '/api/1.0.0/users/:id/updateEmail/:emailId', handler: updateEmailHandler },
  { method: 'DELETE', template: '/api/1.0.0/users/:id/deleteEmail/:emailId', handler: deleteEmailHandler },
  { method: 'POST', template: '/api/1.0.0/users/:id/createDocument', handler: createDocumentHandler },
  { method: 'PUT', template: '/api/1.0.0/users/:id/updateDocument/:documentId', handler: updateDocumentHandler },
  { method: 'DELETE', template: '/api/1.0.0/users/:id/documentDelete/:documentId', handler: deleteDocumentHandler },
  { method: 'POST', template: '/api/1.0.0/users/:id/createPhone', handler: createPhoneHandler },
  { method: 'PUT', template: '/api/1.0.0/users/:id/updatePhone/:phoneId', handler: updatePhoneHandler },
  { method: 'DELETE', template: '/api/1.0.0/users/:id/phoneDelete/:phoneId', handler: deletePhoneHandler }
];

const matchPath = (
  template: string,
  value: string
): { matched: boolean; params: Record<string, string> } => {
  const templateParts = template.split('/').filter(Boolean);
  const valueParts = value.split('/').filter(Boolean);
  if (templateParts.length !== valueParts.length) {
    return { matched: false, params: {} };
  }
  const params: Record<string, string> = {};
  for (let i = 0; i < templateParts.length; i += 1) {
    const templatePart = templateParts[i];
    const valuePart = valueParts[i];

    if (templatePart.startsWith(':')) {
      params[templatePart.slice(1)] = decodeURIComponent(valuePart);
    } else if (templatePart !== valuePart) {
      return { matched: false, params: {} };
    }
  }
  return { matched: true, params };
};

const toApiGatewayEvent = async (
  request: Request,
  routePath: string,
  params: Record<string, string>
): Promise<APIGatewayProxyEvent> => {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const method = request.method.toUpperCase();
  const body = method === 'GET' ? '' : await request.text();

  return {
    body,
    headers,
    httpMethod: request.method.toUpperCase(),
    path: routePath.replace('/api/1.0.0', ''),
    isBase64Encoded: false,
    pathParameters: params,
    queryStringParameters: Object.fromEntries(new URL(request.url).searchParams.entries())
  } as unknown as APIGatewayProxyEvent;
};

export const fetch = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method.toUpperCase();
  const matchedRoute = routes
    .map((route) => ({ route, match: matchPath(route.template, pathname) }))
    .find((candidate) => candidate.route.method === method && candidate.match.matched);

  if (matchedRoute) {
    const event = await toApiGatewayEvent(request, pathname, matchedRoute.match.params);
    const result = await matchedRoute.route.handler(event);
    return new Response(result.body, {
      status: result.statusCode,
      headers: {
        'content-type': 'application/json; charset=utf-8'
      }
    });
  }

  return new Response(JSON.stringify({ message: 'Not found' }), {
    status: 404,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
};
