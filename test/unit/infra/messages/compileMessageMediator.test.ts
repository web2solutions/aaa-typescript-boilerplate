import { compileMessageMediator } from '@src/infra/messages/compileMessageMediator';
import { InMemoryMessageMediatorAdapter } from '@src/infra/messages/adapters/InMemoryMessageMediatorAdapter';
import { RabbitMqMessageMediatorAdapter } from '@src/infra/messages/adapters/RabbitMqMessageMediatorAdapter';
import { BullMqMessageMediatorAdapter } from '@src/infra/messages/adapters/BullMqMessageMediatorAdapter';

describe('compileMessageMediator', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AAA_MESSAGE_MEDIATOR_ADAPTER;
    delete process.env.AAA_RABBITMQ_URL;
    delete process.env.AAA_BULLMQ_REDIS_HOST;
    delete process.env.AAA_BULLMQ_REDIS_PORT;
    delete process.env.AAA_REDIS_HOST;
    delete process.env.AAA_REDIS_PORT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns in-memory adapter by default', () => {
    expect.hasAssertions();
    const mediator = compileMessageMediator();
    expect(mediator).toBeInstanceOf(InMemoryMessageMediatorAdapter);
  });

  it('returns rabbitmq adapter when configured', () => {
    expect.hasAssertions();
    process.env.AAA_MESSAGE_MEDIATOR_ADAPTER = 'rabbitmq';
    process.env.AAA_RABBITMQ_URL = 'amqp://guest:guest@127.0.0.1:5672';

    const mediator = compileMessageMediator();
    expect(mediator).toBeInstanceOf(RabbitMqMessageMediatorAdapter);
  });

  it('returns bullmq adapter when configured', () => {
    expect.hasAssertions();
    process.env.AAA_MESSAGE_MEDIATOR_ADAPTER = 'bullmq';
    process.env.AAA_REDIS_HOST = '127.0.0.1';
    process.env.AAA_REDIS_PORT = '6379';

    const mediator = compileMessageMediator();
    expect(mediator).toBeInstanceOf(BullMqMessageMediatorAdapter);
  });

  it('throws when rabbitmq adapter is configured without url', () => {
    expect.hasAssertions();
    process.env.AAA_MESSAGE_MEDIATOR_ADAPTER = 'rabbitmq';
    expect(() => compileMessageMediator()).toThrow(
      'AAA_RABBITMQ_URL is required when AAA_MESSAGE_MEDIATOR_ADAPTER=rabbitmq'
    );
  });

  it('supports adapter aliases and invalid numeric env fallbacks', () => {
    expect.hasAssertions();
    process.env.AAA_MESSAGE_MEDIATOR_ADAPTER = 'rabbit';
    process.env.AAA_RABBITMQ_URL = 'amqp://guest:guest@127.0.0.1:5672';
    process.env.AAA_RABBITMQ_PREFETCH = 'invalid';
    expect(compileMessageMediator()).toBeInstanceOf(RabbitMqMessageMediatorAdapter);

    process.env.AAA_MESSAGE_MEDIATOR_ADAPTER = 'bull';
    process.env.AAA_BULLMQ_REDIS_PORT = 'invalid';
    process.env.AAA_REDIS_PORT = 'invalid';
    expect(compileMessageMediator()).toBeInstanceOf(BullMqMessageMediatorAdapter);
  });
});
