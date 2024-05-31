import { Type } from "./utils";

export function Injectable() {
  return function <T>(target: Type<T>) {
    // do something with `target`, e.g. some kind of validation or passing it to the Injector and store them
  };
}
