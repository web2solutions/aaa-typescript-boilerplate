/* eslint-disable @typescript-eslint/no-explicit-any */
import * as jwt from 'jsonwebtoken';

import { IJwtService } from '@src/infra/jwt/IJwtService';
import { _JWT_TOKEN_SECRET_KEY_, _JWT_TOKEN_EXPIRES_IN_ } from '@src/config/jwt';
import { ITokenObject } from '@src/modules/Users/service/ports/ITokenObject';
import { NotImplemented } from '@src/infra/exceptions/NotImplemented';

let jwtService: any;

export class JwtService implements IJwtService {
  private secret: string;

  public expiresIn: number;

  constructor(secret = _JWT_TOKEN_SECRET_KEY_) {
    if (!secret) throw new NotImplemented('JWT secret key is not defined');
    this.secret = secret;
    this.expiresIn = _JWT_TOKEN_EXPIRES_IN_;
  }

  public decodeToken(token: string): ITokenObject | null {
    // eslint-disable-next-line no-console
    // console.log('+++++++  decodeToken() SECRET', this.secret);
    let valid = null;
    try {
      valid = jwt.verify(token, this.secret, { }) as ITokenObject;
    } catch (error) {
      valid = null;
    }
    return valid;
  }

  public generateToken(data: Record<any, any>): string {
    const {
      id, username, firstName, avatar, roles
    } = data;
    const token = jwt.sign(
      {
        id, username, firstName, avatar, roles
      },
      this.secret,
      { expiresIn: this.expiresIn }
    );
    return token;
  }

  public static compile() {
    if (jwtService) return jwtService;
    jwtService = new JwtService();
    return jwtService;
  }
}
