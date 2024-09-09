import { APIGatewayProxyEvent } from 'aws-lambda';

export const composeHttpEvent = ({
  body, headers, method, path
}: {
  body?: any, headers?: Record<any, any>, method?: string, path?: string
}): APIGatewayProxyEvent => {
  const event = {
    body: body ? JSON.stringify(body) : '',
    headers: headers || {},
    httpMethod: method || 'GET',
    path: path || '',
    isBase64Encoded: false,
    pathParameters: {},
    queryStringParameters: {}
  } as unknown as APIGatewayProxyEvent;
  return event;
};
