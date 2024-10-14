import { Request } from 'express';
import restify from 'restify';
import { FastifyRequest } from 'fastify';
import HyperExpress from 'hyper-express';

export type IHTTPRequest = FastifyRequest | Request | HyperExpress.Request | restify.Request;
