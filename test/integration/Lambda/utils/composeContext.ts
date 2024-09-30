import { ClientContext, CognitoIdentity, Context } from 'aws-lambda';

export const composeContext = (): Context => {
  return {
    callbackWaitsForEmptyEventLoop: true,
    functionName: '',
    functionVersion: '',
    invokedFunctionArn: '',
    memoryLimitInMB: '',
    awsRequestId: '',
    logGroupName: '',
    logStreamName: '',
    identity: {} as CognitoIdentity,
    clientContext: {} as ClientContext
  } as Context;
};
