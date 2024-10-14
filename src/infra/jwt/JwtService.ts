/* eslint-disable @typescript-eslint/no-explicit-any */
import * as jwt from 'jsonwebtoken';

import { IJwtService } from './IJwtService';
import { _JWT_TOKEN_SECRET_KEY_, _JWT_TOKEN_EXPIRES_IN_ } from '../../config/jwt';
import { ITokenObject } from '../../modules/Users/service/ports/ITokenObject';

let jwtService: any;

export class JwtService implements IJwtService {
  private secret: string;

  public expiresIn: number;

  constructor(secret = _JWT_TOKEN_SECRET_KEY_) {
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
