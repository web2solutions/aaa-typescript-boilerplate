import users from '@seed/users';

const user = users[1];
const { username, password } = user.login;
const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
const BasicAuthorizationHeaderUser2 = {
  Authorization: `Basic ${token}`
};

export default BasicAuthorizationHeaderUser2;
