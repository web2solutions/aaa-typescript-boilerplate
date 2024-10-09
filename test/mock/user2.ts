// file deepcode ignore NoHardcodedPasswords/test: <mocked password>
import { EEmailType, EmailValueObject } from '@src/domains/valueObjects';

const user2 = {
  firstName: 'User',
  lastName: 'Number 2',
  emails: [{
    email: 'usernumber2@xpertminds.dev',
    type: EEmailType.work,
    isPrimary: true
  } as EmailValueObject],
  avatar: 'avatar.png',
  username: 'usernumber2@xpertminds.dev',
  password: 'usernumber2_password',
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
export default user2;
