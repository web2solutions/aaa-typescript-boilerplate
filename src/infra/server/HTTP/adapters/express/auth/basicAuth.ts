import { Request, Response, NextFunction } from 'express';
import users from '../../../../../../../seed/users';

const basicAuth = (req: Request, res: Response, next: NextFunction) => {
  const AuthHeader = req.get('Authorization') ?? '';
  const b64auth = AuthHeader.split(' ')[1] || '';
  const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':');
  let userFound;
  for (const user of users) {
    if (user.username === username) {
      userFound = user;
      break;
    }
  }
  if (!userFound) {
    return res.status(401).json({ message: 'user not found' });
  }
  if (userFound.password !== password) {
    return res.status(401).json({ message: 'invalid password' });
  }

  (req as any).profile = userFound;
  // console.log((req as any).profile)
  return next();
};

export default basicAuth;
