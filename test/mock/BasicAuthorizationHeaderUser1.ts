import users from '@seed/users';

const user = users[0];
const { username, password } = user.login;
const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
const BasicAuthorizationHeaderUser1 = {
  Authorization: `Basic ${token}`
};

export default BasicAuthorizationHeaderUser1;
