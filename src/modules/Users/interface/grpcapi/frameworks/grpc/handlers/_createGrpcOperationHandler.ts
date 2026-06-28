import {
  IAsyncOperationRequest,
  IAsyncOperationResponse,
  IRealtimeHandlerFactoryDeps
} from '@src/interface/Async/RealtimeAPIBase';

const createGrpcOperationHandler = (operationId: string) => (
  { invoke }: IRealtimeHandlerFactoryDeps
) => async (request: IAsyncOperationRequest): Promise<IAsyncOperationResponse> => {
  const requestId = request.metadata?.requestId || request.metadata?.correlationId || '';
  const clientId = request.metadata?.clientId || '';
  const channel = `grpc:${operationId}:response`;
  const response = await invoke({
    ...request,
    metadata: {
      ...(request.metadata || {}),
      requestId,
      clientId,
      channel
    },
    operationId
  });
  return {
    ...response,
    metadata: {
      ...(response.metadata || {}),
      requestId,
      clientId,
      channel
    }
  };
};

export default createGrpcOperationHandler;
