import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import { IHandlerFactory } from './IHandlerFactory';

export type EndPointFactory = (config: IHandlerFactory) => IbaseHandler;
