import { IbaseHandler } from '@src/interface/HTTP/ports/IbaseHandler';
import { IHandlerFactory } from './IHandlerFactory';

export type EndPointFactory = (config: IHandlerFactory) => IbaseHandler;
