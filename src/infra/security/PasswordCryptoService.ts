import * as bcrypt from 'bcryptjs';
import { _BCRYPT_SALT_ROUNDS_ } from '../config/constants';
import { IPasswordCryptoService, IHash } from './IPasswordCryptoService';

let passwordCryptoService: IPasswordCryptoService;

export class PasswordCryptoService implements IPasswordCryptoService {
  private saltRounds: number;

  constructor() {
    this.saltRounds = +(_BCRYPT_SALT_ROUNDS_);
  }

  private genSalt(): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(this.saltRounds, (err: Error | null, salt: unknown) => {
        if (err) {
          return reject(err);
        }
        return resolve(salt as string);
      });
    });
  }

  public hash(password: string): Promise<IHash> {
    return new Promise((resolve, reject) => {
      (async () => {
        const salt = await this.genSalt();
        bcrypt.hash(password, salt, (err: Error | null, hash: string) => {
          if (err) {
            return reject(err);
          }
          return resolve({
            hash,
            salt
          } as unknown as IHash);
        });
      })();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public compare(plainPassword: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainPassword, hash, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  public static compile() {
    if (passwordCryptoService) return passwordCryptoService;
    passwordCryptoService = new PasswordCryptoService();
    return passwordCryptoService;
  }
}
