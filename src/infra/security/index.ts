import xss from 'xss';

export class Security {
  public static xss(str: string): string {
    return xss(str);
  }
}
