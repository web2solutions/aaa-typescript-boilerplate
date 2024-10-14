import { Response } from 'express';
import { FastifyReply } from 'fastify';
import restify from 'restify';
import HyperExpress from 'hyper-express';

export type IHTTPResponse = FastifyReply | Response | HyperExpress.Response | restify.Response;
