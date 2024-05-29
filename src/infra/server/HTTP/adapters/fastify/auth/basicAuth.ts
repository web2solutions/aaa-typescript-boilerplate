import { FastifyRequest, FastifyReply } from 'fastify';
import users from '@seed/users';

const basicAuth = (req: FastifyRequest, res: FastifyReply, next: any) => {
  const AuthHeader = req.headers.authorization ?? '';
  const b64auth = (AuthHeader as string).split(' ')[1] || '';
  const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':');
  let userFound;
  for (const user of users) {
    if (user.login.username === username) {
      userFound = user;
      break;
    }
  }
  if (!userFound) {
    return res.code(401).send({ message: 'user not found' });
  }
  if (userFound.login.password !== password) {
    return res.code(401).send({ message: 'invalid password' });
  }

  (req as any).profile = userFound;
  // console.log((req as any).profile)
  return next();
};

export default basicAuth;
