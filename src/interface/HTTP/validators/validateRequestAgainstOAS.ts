import { OpenAPIV3 } from 'openapi-types';
import throwIfOASInputValidationFails from './throwIfOASInputValidationFails';
import validateRequestParams from './validateRequestParams';

type RequestValidationInput = {
  input?: unknown;
  params?: Record<string, any>;
  queryString?: Record<string, any>;
  authorization?: string;
};

export default function validateRequestAgainstOAS(
  spec: OpenAPIV3.Document,
  endPointConfig: Record<string, any>,
  request: RequestValidationInput
): boolean {
  validateRequestParams(
    endPointConfig,
    request.params || {},
    request.queryString || {},
    { authorization: request.authorization || '' }
  );

  return throwIfOASInputValidationFails(
    spec,
    endPointConfig,
    request.input
  );
}
