// file deepcode ignore NoHardcodedPasswords/test: <mocked password>
import { EEmailType, EmailValueObject } from '@src/domains/valueObjects';

const user3 = {
  firstName: 'User',
  lastName: 'Number 3',
  emails: [{
    email: 'usernumber3@xpertminds.dev',
    type: EEmailType.work,
    isPrimary: true
  } as EmailValueObject],
  avatar: 'avatar.png',
  username: 'usernumber3@xpertminds.dev',
  password: 'usernumber3_password',
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
export default user3;
