export interface IRepositoryConnectionOptions {
  provider?: string;
  connectionUrl?: string;
  database?: string;
  extra?: Record<string, unknown>;
  region?: string;
  endpoint?: string;
}

export abstract class BaseExternalDataRepository {
  protected readonly options: IRepositoryConnectionOptions;

  protected connected = false;

  protected constructor(options: IRepositoryConnectionOptions) {
    this.options = options;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getProviderName(): string {
    return this.options.provider || 'unknown-provider';
  }

  protected getRequiredOption(key: keyof IRepositoryConnectionOptions): string {
    const value = this.options[key];
    if (!value || String(value).trim() === '') {
      throw new Error(`Missing required option "${String(key)}" for ${this.getProviderName()}`);
    }
    return String(value).trim();
  }

  protected getExtraOption<T>(key: string, fallback: T): T {
    const value = this.options.extra?.[key];
    if (value === undefined || value === null) return fallback;
    return value as T;
  }

  protected async loadModule(moduleName: string): Promise<any> {
    try {
      return await import(moduleName);
    } catch (error) {
      throw new Error(
        `Missing optional dependency "${moduleName}" for ${this.getProviderName()}. Install it before connecting.`
      );
    }
  }

  protected async loadOptionalModule(moduleName: string): Promise<any | null> {
    try {
      return await this.loadModule(moduleName);
    } catch (error) {
      return null;
    }
  }

  public abstract connect(): Promise<void>;

  public abstract disconnect(): Promise<void>;
}
