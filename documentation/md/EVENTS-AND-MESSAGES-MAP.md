# Events and Messages Map

This document maps the current integration contracts used by the boilerplate, including event publishing/subscription and request/response message contracts through `MessageMediator`.

## 1) Integration Event Envelope

Published through `IEventBus.publish(event)` (and therefore also through `IMessageMediator`, since it extends `IEventBus`):

```ts
interface IIntegrationEvent {
  name: string;
  payload: Record<string, any>;
  occurredAt?: string;
}
```

## 2) Request/Response Message Envelope

Used through `IMessageMediator.request(message, options)` and `registerHandler(contract, handler, options)`:

```ts
interface IMessage<TPayload = any> {
  contract: string;
  version?: string;
  payload: TPayload;
  metadata?: {
    requestId?: string;
    correlationId?: string;
    causationId?: string;
    replyTo?: string;
    timestamp?: string;
    headers?: Record<string, string>;
  };
}

interface IMessageResponse<TResult = any> {
  contract: string;
  version?: string;
  metadata?: IMessageMetadata;
  result?: TResult;
  error?: Error | Record<string, any>;
}
```

## 3) Message Mediator Adapters

- `inmemory` (default): synchronous in-process dispatch with optional timeout.
- `rabbitmq`: queue-based request/reply + topic exchange publish.
- `bullmq`: Redis queue-based request/reply + event queues.

Selection is made by `AAA_MESSAGE_MEDIATOR_ADAPTER` in `src/infra/messages/compileMessageMediator.ts`.

## 4) Current Domain Event Map (Users)

Producer: `UserService` (`src/modules/Users/service/UserService.ts`)

| Event Name | Published By | Trigger |
|---|---|---|
| `users.user.created` | `UserService.create` | user created |
| `users.user.updated` | `UserService.update` | user updated |
| `users.user.deleted` | `UserService.delete` | user deleted |
| `users.user.credentialsUpdated` | `UserService.updatePassword` | password/credentials updated |

Listeners are registered in `registerUserEventListeners` (`src/modules/Users/events/listeners/registerUserEventListeners.ts`) through:
- `onUserCreated`
- `onUserUpdated`
- `onUserDeleted`
- `onUserPasswordUpdated`

## 5) Current Request/Response Contract Map (Users/Auth)

Registered in `registerUserMessageHandlers` (`src/modules/Users/events/listeners/registerUserMessageHandlers.ts`):

| Contract | Handler Owner | Input Payload | Result / Error |
|---|---|---|---|
| `users.auth.authorize` | Users Auth service | `{ authorization: string }` | authenticated user payload or error |
| `users.auth.ensure-access` | Users Auth service | `{ authorization: string, schemaOAS: Record<string, any> }` | authorized user payload or error if forbidden/unauthorized |

## 6) Where Contracts Are Consumed

- `Authorize` decorator (`src/shared/decorators/guard/Authorize.ts`) calls:
  - `users.auth.ensure-access`
- Composition root (`composeUsersAuthServices`) registers domain contracts when a mediator exists.

This keeps request/response authorization contract-based and decoupled from direct service injection.

## 7) Runtime Topology (Current)

1. HTTP adapter receives request.
2. Controller/use case emits domain events or asks `MessageMediator` for cross-service checks.
3. Mediator dispatches by selected adapter (`inmemory` / `rabbitmq` / `bullmq`).
4. Handler returns a contract response (`result` or `error`).

## 8) Extension Guidelines for New Domains

When adding a new domain:

1. Define integration event names (`<domain>.<entity>.<action>`).
2. Publish events from services after successful state transitions.
3. Define request/response contracts (`<domain>.<capability>.<verb>`).
4. Register handlers in domain composition.
5. Keep payloads versionable (`version` + metadata).
6. Document new contracts in this file and in domain docs.
