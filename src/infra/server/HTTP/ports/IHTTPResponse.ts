import { Response } from 'express';
import { FastifyReply } from 'fastify';
import HyperExpress from 'hyper-express';

export type IHTTPResponse = FastifyReply | Response | HyperExpress.Response;
