import { AsyncLocalStorage } from 'node:async_hooks';

export const Context = new AsyncLocalStorage();
