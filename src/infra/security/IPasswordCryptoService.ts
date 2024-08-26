export interface IHash {
  hash: string;
  salt: string;
}

export interface IPasswordCryptoService {
  hash(password: string): Promise<IHash>;
  compare(plainPassword: string, hash: string): Promise<boolean>;
}
