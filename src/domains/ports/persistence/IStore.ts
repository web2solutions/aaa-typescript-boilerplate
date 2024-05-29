export interface IStore<T> {
  delete(id: string): Promise<boolean>;
  getOneById(id: string): Promise<T>;
  getByName?(name: string): Promise<T>;
  create(key: string, value: T): Promise<T>;
  update(key: string, value: T): Promise<T>;
  getAll(page?: number, limit?: number) : Promise<T[]>;
  getByUserEmail?(userEmail: string): Promise<T>;
}
