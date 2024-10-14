import { ITokenObject } from '../../modules/Users/service/ports/ITokenObject';

export interface IJwtService {
  decodeToken(token: string): ITokenObject | null;
  generateToken(user: Record<any, any>): string;
}
