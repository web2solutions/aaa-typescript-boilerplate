import { Handler, APIGatewayProxyResult } from 'aws-lambda';

export const handler: Handler = async ():
Promise<APIGatewayProxyResult> => {
  // console.log(event);
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'result' })
  };
};
