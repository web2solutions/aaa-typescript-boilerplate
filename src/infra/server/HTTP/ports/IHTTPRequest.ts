import { Request } from 'express';
import { FastifyRequest } from 'fastify';
import HyperExpress from 'hyper-express';

export type IHTTPRequest = FastifyRequest | Request | HyperExpress.Request;
