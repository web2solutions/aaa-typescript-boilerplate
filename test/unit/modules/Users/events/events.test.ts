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
import { OrganizationCreateRequestEvent } from '@src/modules/Users/events/OrganizationCreateRequestEvent';
import { OrganizationDeleteRequestEvent } from '@src/modules/Users/events/OrganizationDeleteRequestEvent';
import { OrganizationGetAllRequestEvent } from '@src/modules/Users/events/OrganizationGetAllRequestEvent';
import { OrganizationGetOneRequestEvent } from '@src/modules/Users/events/OrganizationGetOneRequestEvent';
import { OrganizationUpdateRequestEvent } from '@src/modules/Users/events/OrganizationUpdateRequestEvent';
import { OrganizationAddressCreateRequestEvent } from '@src/modules/Users/events/OrganizationAddressCreateRequestEvent';
import { OrganizationAddressUpdateRequestEvent } from '@src/modules/Users/events/OrganizationAddressUpdateRequestEvent';
import { OrganizationAddressDeleteRequestEvent } from '@src/modules/Users/events/OrganizationAddressDeleteRequestEvent';
import { OrganizationPhoneCreateRequestEvent } from '@src/modules/Users/events/OrganizationPhoneCreateRequestEvent';
import { OrganizationPhoneUpdateRequestEvent } from '@src/modules/Users/events/OrganizationPhoneUpdateRequestEvent';
import { OrganizationPhoneDeleteRequestEvent } from '@src/modules/Users/events/OrganizationPhoneDeleteRequestEvent';
import { OrganizationEmailCreateRequestEvent } from '@src/modules/Users/events/OrganizationEmailCreateRequestEvent';
import { OrganizationEmailUpdateRequestEvent } from '@src/modules/Users/events/OrganizationEmailUpdateRequestEvent';
import { OrganizationEmailDeleteRequestEvent } from '@src/modules/Users/events/OrganizationEmailDeleteRequestEvent';

const validMessage = (): IEventMessage => ({
  authorization: 'Bearer token',
  input: { firstName: 'John' },
  params: {
    id: 'u1', emailId: 'e1', phoneId: 'p1', documentId: 'd1', addressId: 'a1'
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
      new UserUpdateRequestEvent(validMessage()),
      new OrganizationCreateRequestEvent(validMessage()),
      new OrganizationDeleteRequestEvent(validMessage()),
      new OrganizationGetAllRequestEvent(validMessage()),
      new OrganizationGetOneRequestEvent(validMessage()),
      new OrganizationUpdateRequestEvent(validMessage()),
      new OrganizationAddressCreateRequestEvent(validMessage()),
      new OrganizationAddressUpdateRequestEvent(validMessage()),
      new OrganizationAddressDeleteRequestEvent(validMessage()),
      new OrganizationPhoneCreateRequestEvent(validMessage()),
      new OrganizationPhoneUpdateRequestEvent(validMessage()),
      new OrganizationPhoneDeleteRequestEvent(validMessage()),
      new OrganizationEmailCreateRequestEvent(validMessage()),
      new OrganizationEmailUpdateRequestEvent(validMessage()),
      new OrganizationEmailDeleteRequestEvent(validMessage())
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

    const eventCtors = [
      LoginRequestEvent,
      LogoutRequestEvent,
      RegisterRequestEvent,
      UpdatePasswordRequestEvent,
      UserDeleteRequestEvent,
      UserDocumentCreateRequestEvent,
      UserDocumentDeleteRequestEvent,
      UserDocumentUpdateRequestEvent,
      UserEmailCreateRequestEvent,
      UserEmailDeleteRequestEvent,
      UserEmailUpdateRequestEvent,
      UserGetOneRequestEvent,
      UserPasswordUpdateRequestEvent,
      UserPhoneCreateRequestEvent,
      UserPhoneDeleteRequestEvent,
      UserPhoneUpdateRequestEvent,
      OrganizationCreateRequestEvent,
      OrganizationDeleteRequestEvent,
      OrganizationGetAllRequestEvent,
      OrganizationGetOneRequestEvent,
      OrganizationUpdateRequestEvent,
      OrganizationAddressCreateRequestEvent,
      OrganizationAddressUpdateRequestEvent,
      OrganizationAddressDeleteRequestEvent,
      OrganizationPhoneCreateRequestEvent,
      OrganizationPhoneUpdateRequestEvent,
      OrganizationPhoneDeleteRequestEvent,
      OrganizationEmailCreateRequestEvent,
      OrganizationEmailUpdateRequestEvent,
      OrganizationEmailDeleteRequestEvent
    ];

    for (const EventCtor of eventCtors) {
      expect(() => new EventCtor({ authorization: 'Bearer token' } as IEventMessage)).toThrow(ComposeEventError);
    }
  });
});
