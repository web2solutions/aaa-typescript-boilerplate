import { ITokenObject } from '../auth/ITokenObject';

export interface IJwtService {
  decodeToken(token: string): ITokenObject | null;
  generateToken(user: Record<any, any>): string;
}
