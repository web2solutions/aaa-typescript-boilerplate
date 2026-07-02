import { IMessageMediator } from './contracts';
import { InMemoryMessageMediatorAdapter } from './InMemoryMessageMediatorAdapter';
import { RabbitMqMessageMediatorAdapter } from './RabbitMqMessageMediatorAdapter';
import { BullMqMessageMediatorAdapter } from './BullMqMessageMediatorAdapter';

const DEFAULT_BULLMQ_PORT = 6379;
const DEFAULT_RABBITMQ_PREFETCH = 10;

const parseOptionalNumber = (input: string | undefined): number | undefined => {
  if (!input) {
    return undefined;
  }
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const compileMessageMediator = (): IMessageMediator => {
  const adapter = (process.env.AAA_MESSAGE_MEDIATOR_ADAPTER || 'inmemory')
    .trim()
    .toLowerCase();

  if (adapter === 'rabbitmq' || adapter === 'rabbit') {
    const url = process.env.AAA_RABBITMQ_URL;
    if (!url) {
      throw new Error('AAA_RABBITMQ_URL is required when AAA_MESSAGE_MEDIATOR_ADAPTER=rabbitmq');
    }

    return new RabbitMqMessageMediatorAdapter({
      url,
      exchangeName: process.env.AAA_RABBITMQ_EXCHANGE,
      defaultRequestQueue: process.env.AAA_RABBITMQ_REQUEST_QUEUE,
      prefetch: parseOptionalNumber(process.env.AAA_RABBITMQ_PREFETCH) ?? DEFAULT_RABBITMQ_PREFETCH
    });
  }

  if (adapter === 'bullmq' || adapter === 'bull') {
    return new BullMqMessageMediatorAdapter({
      connection: {
        host: process.env.AAA_BULLMQ_REDIS_HOST || process.env.AAA_REDIS_HOST || '127.0.0.1',
        port: parseOptionalNumber(process.env.AAA_BULLMQ_REDIS_PORT)
          ?? parseOptionalNumber(process.env.AAA_REDIS_PORT)
          ?? DEFAULT_BULLMQ_PORT,
        username: process.env.AAA_BULLMQ_REDIS_USERNAME,
        password: process.env.AAA_BULLMQ_REDIS_PASSWORD || process.env.AAA_REDIS_PASSWORD,
        db: parseOptionalNumber(process.env.AAA_BULLMQ_REDIS_DB)
      },
      defaultRequestQueue: process.env.AAA_BULLMQ_REQUEST_QUEUE
    });
  }

  return InMemoryMessageMediatorAdapter.compile();
};
