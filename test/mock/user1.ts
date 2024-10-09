import { EEmailType, EmailValueObject } from '@src/domains/valueObjects';

// file deepcode ignore NoHardcodedPasswords/test: <mocked password>
const user1 = {
  firstName: 'User',
  lastName: 'Number 1',
  emails: [{
    email: 'usernumber1@xpertminds.dev',
    type: EEmailType.work,
    isPrimary: true
  } as EmailValueObject],
  avatar: 'avatar.png',
  username: 'usernumber1@xpertminds.dev',
  password: 'usernumber1_password',
  roles: [
    'access_allow',
    'create_account',
    'read_account',
    'update_account',
    'delete_account',
    'create_transaction',
    'delete_transaction',
    'read_transaction',
    'create_user',
    'read_user',
    'update_user',
    'delete_user'
  ]
};
export default user1;
