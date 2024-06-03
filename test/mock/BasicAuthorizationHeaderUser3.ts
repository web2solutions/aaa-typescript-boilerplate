import users from '@seed/users';

const user = users[2];
const { username, password } = user;
const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
const BasicAuthorizationHeaderUser3 = {
  Authorization: `Basic ${token}`
};

export default BasicAuthorizationHeaderUser3;
