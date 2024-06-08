import * as bcrypt from 'bcrypt';
import { _BCRYPT_SALT_ROUNDS_ } from '../config/constants';

interface IHash {
  hash: string;
  salt: string;
}

export interface IPasswordCryptoService {
  hash(password: string): Promise<IHash>;
  compare(plainPassword: string, hash: string): Promise<boolean>;
}

let passwordCryptoService: IPasswordCryptoService;

export class PasswordCryptoService implements IPasswordCryptoService {
  private saltRounds: number;

  constructor() {
    this.saltRounds = +(_BCRYPT_SALT_ROUNDS_);
  }

  private genSalt(): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(this.saltRounds, (err: unknown, salt: unknown) => {
        if (err) {
          return reject(err);
        }
        return resolve(salt as unknown as string);
      });
    });
  }

  public hash(password: string): Promise<IHash> {
    // eslint-disable-next-line no-async-promise-executor, @typescript-eslint/no-misused-promises
    return new Promise(async (resolve, reject) => {
      const salt = await this.genSalt();
      // eslint-disable-next-line no-console
      // console.log('salt', salt);
      bcrypt.hash(password, salt, (err: unknown, hash: string) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          hash,
          salt
        } as unknown as IHash);
      });
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
    return passwordCryptoService as IPasswordCryptoService;
  }
}
