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
      const verifyOptions: jwt.VerifyOptions = {};
      if (process.env.AAA_JWT_ISSUER) {
        verifyOptions.issuer = process.env.AAA_JWT_ISSUER;
      }
      if (process.env.AAA_JWT_AUDIENCE) {
        verifyOptions.audience = process.env.AAA_JWT_AUDIENCE;
      }
      valid = jwt.verify(token, this.secret, verifyOptions) as ITokenObject;
    } catch (error) {
      valid = null;
    }
    return valid;
  }

  public generateToken(data: Record<any, any>): string {
    const {
      id, username, firstName, avatar, organization, roles
    } = data;
    const signOptions: jwt.SignOptions = { expiresIn: this.expiresIn };
    if (process.env.AAA_JWT_ISSUER) {
      signOptions.issuer = process.env.AAA_JWT_ISSUER;
    }
    if (process.env.AAA_JWT_AUDIENCE) {
      signOptions.audience = process.env.AAA_JWT_AUDIENCE;
    }
    const token = jwt.sign(
      {
        jti: `${id || username || 'anonymous'}:${Math.floor(Date.now() / 1000)}`,
        id,
        username,
        firstName,
        avatar,
        organization,
        roles
      },
      this.secret,
      signOptions
    );
    return token;
  }

  public static compile() {
    if (jwtService) return jwtService;
    jwtService = new JwtService();
    return jwtService;
  }
}
