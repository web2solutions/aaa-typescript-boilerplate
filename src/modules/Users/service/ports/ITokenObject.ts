import { JwtPayload } from 'jsonwebtoken';

export interface ITokenObject extends JwtPayload {
  id: string;
  username: string;
  firstName: string;
  avatar: string;
}
