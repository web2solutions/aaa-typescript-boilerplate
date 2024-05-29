import users from '@seed/users';

const user = users[3];
const { username, password } = user.login;
const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
const BasicAuthorizationHeaderUser4 = {
  Authorization: `Basic ${token}`
};

export default BasicAuthorizationHeaderUser4;
