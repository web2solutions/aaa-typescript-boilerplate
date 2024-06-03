const user = {
  username: 'guest',
  password: 'guest',
  roles: []
};
const { username, password } = user;
const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
const BasicAuthorizationHeaderUserGuest = {
  Authorization: `Basic ${token}`
};

export default BasicAuthorizationHeaderUserGuest;
