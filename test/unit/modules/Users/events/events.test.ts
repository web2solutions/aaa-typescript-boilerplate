import { ComposeEventError } from '@src/infra/exceptions';
import { IEventMessage } from '@src/modules/port/IEventMessage';
import { LoginRequestEvent } from '@src/modules/Users/events/LoginRequestEvent';
import { LogoutRequestEvent } from '@src/modules/Users/events/LogoutRequestEvent';
import { RegisterRequestEvent } from '@src/modules/Users/events/RegisterRequestEvent';
import { UpdatePasswordRequestEvent } from '@src/modules/Users/events/UpdatePasswordRequestEvent';
import { UserCreateRequestEvent } from '@src/modules/Users/events/UserCreateRequestEvent';
import { UserDeleteRequestEvent } from '@src/modules/Users/events/UserDeleteRequestEvent';
import { UserDocumentCreateRequestEvent } from '@src/modules/Users/events/UserDocumentCreateRequestEvent';
import { UserDocumentDeleteRequestEvent } from '@src/modules/Users/events/UserDocumentDeleteRequestEvent';
import { UserDocumentUpdateRequestEvent } from '@src/modules/Users/events/UserDocumentUpdateRequestEvent';
import { UserEmailCreateRequestEvent } from '@src/modules/Users/events/UserEmailCreateRequestEvent';
import { UserEmailDeleteRequestEvent } from '@src/modules/Users/events/UserEmailDeleteRequestEvent';
import { UserEmailUpdateRequestEvent } from '@src/modules/Users/events/UserEmailUpdateRequestEvent';
import { UserGetAllRequestEvent } from '@src/modules/Users/events/UserGetAllRequestEvent';
import { UserGetOneRequestEvent } from '@src/modules/Users/events/UserGetOneRequestEvent';
import { UserPasswordUpdateRequestEvent } from '@src/modules/Users/events/UserPasswordUpdateRequestEvent';
import { UserPhoneCreateRequestEvent } from '@src/modules/Users/events/UserPhoneCreateRequestEvent';
import { UserPhoneDeleteRequestEvent } from '@src/modules/Users/events/UserPhoneDeleteRequestEvent';
import { UserPhoneUpdateRequestEvent } from '@src/modules/Users/events/UserPhoneUpdateRequestEvent';
import { UserUpdateRequestEvent } from '@src/modules/Users/events/UserUpdateRequestEvent';

const validMessage = (): IEventMessage => ({
  authorization: 'Bearer token',
  input: { firstName: 'John' },
  params: {
    id: 'u1', emailId: 'e1', phoneId: 'p1', documentId: 'd1'
  },
  queryString: { page: '1' },
  schemaOAS: { operationId: 'usersCreate' },
  metadata: {
    correlationId: 'c1', causationId: 'c0', timestamp: Date.now(), userId: 'u1'
  }
});

describe('users request events', () => {
  it('composes all event types with entity/action', () => {
    expect.hasAssertions();

    const events = [
      new LoginRequestEvent(validMessage()),
      new LogoutRequestEvent(validMessage()),
      new RegisterRequestEvent(validMessage()),
      new UpdatePasswordRequestEvent(validMessage()),
      new UserCreateRequestEvent(validMessage()),
      new UserDeleteRequestEvent(validMessage()),
      new UserDocumentCreateRequestEvent(validMessage()),
      new UserDocumentDeleteRequestEvent(validMessage()),
      new UserDocumentUpdateRequestEvent(validMessage()),
      new UserEmailCreateRequestEvent(validMessage()),
      new UserEmailDeleteRequestEvent(validMessage()),
      new UserEmailUpdateRequestEvent(validMessage()),
      new UserGetAllRequestEvent(validMessage()),
      new UserGetOneRequestEvent(validMessage()),
      new UserPasswordUpdateRequestEvent(validMessage()),
      new UserPhoneCreateRequestEvent(validMessage()),
      new UserPhoneDeleteRequestEvent(validMessage()),
      new UserPhoneUpdateRequestEvent(validMessage()),
      new UserUpdateRequestEvent(validMessage())
    ];

    for (const event of events) {
      expect(event.entity).toBeDefined();
      expect(event.action).toBeDefined();
    }
  });

  it('throws ComposeEventError when required fields are missing', () => {
    expect.hasAssertions();
    expect(() => new UserCreateRequestEvent({} as IEventMessage)).toThrow(ComposeEventError);
    expect(() => new UserUpdateRequestEvent({ authorization: 'Bearer token' } as IEventMessage)).toThrow(ComposeEventError);
    expect(() => new UserGetAllRequestEvent({ authorization: 'Bearer token' } as IEventMessage)).toThrow(ComposeEventError);
  });
});
