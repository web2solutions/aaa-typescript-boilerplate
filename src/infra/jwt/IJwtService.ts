import { JwtPayload } from 'jsonwebtoken';

export interface IJwtService {
  decodeToken(token: string): JwtPayload | null;
  generateToken(user: Record<any, any>): string;
}
