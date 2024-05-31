/* eslint max-classes-per-file: "off" */
/* eslint no-shadow: "off" */

export class Dependencies {
  // holding instances of Injectable classes by key
  private static registry: Map<string, any> = new Map();

  static register(key: string, instance: any) {
    if (!Dependencies.registry.has(key)) {
      Dependencies.registry.set(key, instance);
      // console.log(`Added ${key} to the registry.`);
    }
  }

  static get(key: string) {
    return Dependencies.registry.get(key);
  }
}

interface Injection {
  index: number;
  key: string;
}

// add to class which has constructor paramteters marked with @inject()
export function Injectable() {
  return function Injectable <T extends { new(...args: any[]): {} }>(constructor: T): T | void {
    return class extends constructor {
      constructor(...args: any[]) {
        const injections = (constructor as any).injections as Injection[];
        const injectedArgs: any[] = injections.map(({ key }) => {
          return Dependencies.get(key);
        });
        super(...injectedArgs);
      }
    };
  };
}

export function inject(key: string) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    const injection: Injection = { index: parameterIndex, key };
    const existingInjections: Injection[] = (target as any).injections || [];
    // create property 'injections' holding all constructor parameters, which should be injected
    Object.defineProperty(target, 'injections', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: [...existingInjections, injection]
    });
  };
}
